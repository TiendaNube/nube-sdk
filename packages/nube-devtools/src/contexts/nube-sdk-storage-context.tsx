import {
	type PageStorageEntry,
	type PageStorageType,
	parseStorageKey,
	readPageStorage,
	removePageStorage,
	setPageStorage,
	unwrapStorageValue,
} from "@/utils";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { ReactNode } from "react";

/** One storage mutation as reported by the injected page patch. */
export type NubeSDKStorageEvent = {
	method: "setItem" | "removeItem" | "clear";
	type: PageStorageType;
	key: string;
	value: string | null;
	timestamp?: number;
};

/**
 * One entry that currently exists in the page's storage.
 *
 * The panel models storage as state rather than as a log of calls: a write to
 * a key the list already holds replaces its value instead of appending a row,
 * which is what makes the list match what the page would show if inspected
 * directly.
 */
export type NubeSDKStorageRecord = {
	/**
	 * `type:storageKey` — the entry's real identity. Not the key alone: the
	 * same key can exist in both storages at once, and since the key carries
	 * the app namespace this also keeps two apps' identically-named keys
	 * apart.
	 */
	id: string;
	type: PageStorageType;
	/** The app that owns the entry, as namespaced in the key. */
	appId: string;
	/** The key the app passed, without the `app-<appId>-` prefix. */
	key: string;
	storageKey: string;
	value: string;
	/**
	 * When this panel *observed* the value change, or null for an entry that
	 * was already in storage when the panel snapshotted it.
	 *
	 * Null rather than the snapshot time on purpose: a `localStorage` entry
	 * can predate the session by weeks, and showing the moment devtools found
	 * it as "just now" would be wrong in the one direction that matters.
	 */
	updatedAt: number | null;
	/**
	 * The entry's expiration, epoch ms, or null when it was stored without a
	 * TTL.
	 *
	 * Resolved here, when the value changes, rather than in render: the list
	 * needs it on every row and re-parsing each payload on each re-render would
	 * be work for nothing.
	 */
	expiresAt: number | null;
};

interface NubeSDKStorageContextType {
	records: NubeSDKStorageRecord[];
	/**
	 * True until the first read of the page's storages resolves.
	 *
	 * Only ever cleared, never raised again by the poll: without it an empty
	 * list and a list that has not been read yet look identical, and the panel
	 * would claim "nothing stored" for the moment before its first read lands.
	 */
	isLoading: boolean;
	/** Re-reads the page's storages and rebuilds the list from them. */
	refresh: () => Promise<void>;
	/** Writes a new value for an existing entry. */
	saveValue: (record: NubeSDKStorageRecord, value: string) => Promise<boolean>;
	/** Deletes an entry from the page's storage. */
	removeRecord: (record: NubeSDKStorageRecord) => Promise<boolean>;
}

const NubeSDKStorageContext = createContext<
	NubeSDKStorageContextType | undefined
>(undefined);

const recordId = (type: PageStorageType, storageKey: string) =>
	`${type}:${storageKey}`;

function toRecord(
	type: PageStorageType,
	storageKey: string,
	value: string,
	updatedAt: number | null,
): NubeSDKStorageRecord | null {
	const parsed = parseStorageKey(storageKey);
	// Not an app entry: the page's own keys reach the snapshot and the native
	// `storage` event, and neither belongs in this panel.
	if (!parsed) return null;

	return {
		id: recordId(type, storageKey),
		type,
		appId: parsed.appId,
		key: parsed.key,
		storageKey,
		value,
		updatedAt,
		expiresAt: unwrapStorageValue(value).expiresAt,
	};
}

/**
 * Whether two lists describe the same storage state.
 *
 * The poll below re-reads the page every couple of seconds, and an unchanged
 * storage has to yield the *same array*: a fresh one would invalidate every
 * memo downstream and re-render the list for nothing, several times a minute.
 */
function sameRecords(
	a: NubeSDKStorageRecord[],
	b: NubeSDKStorageRecord[],
): boolean {
	if (a.length !== b.length) return false;

	// Compared position by position: both sides come from the storage's own
	// enumeration order, which is stable for as long as the keys are.
	for (let index = 0; index < a.length; index++) {
		if (
			a[index].id !== b[index].id ||
			a[index].value !== b[index].value ||
			a[index].updatedAt !== b[index].updatedAt
		) {
			return false;
		}
	}

	return true;
}

/** Rebuilds the list from a snapshot, keeping the old array when nothing moved. */
function reconcile(
	previous: NubeSDKStorageRecord[],
	entries: PageStorageEntry[],
): NubeSDKStorageRecord[] {
	const previousById = new Map(
		previous.map((record) => [record.id, record] as const),
	);

	const next = entries.flatMap((entry) => {
		const previousRecord = previousById.get(recordId(entry.type, entry.key));
		const updatedAt =
			previousRecord && previousRecord.value === entry.value
				? previousRecord.updatedAt
				: null;

		const record = toRecord(entry.type, entry.key, entry.value, updatedAt);
		return record ? [record] : [];
	});

	return sameRecords(previous, next) ? previous : next;
}

/**
 * How long to wait after a navigation before snapshotting.
 *
 * `onNavigated` fires before the apps have booted, and the new document's
 * storages are read as they are at that instant. The delay lets the first
 * round of app writes land, so the snapshot is not immediately stale; anything
 * written after it still arrives through the patch.
 */
const SNAPSHOT_AFTER_NAVIGATION_DELAY = 300;

export const NubeSDKStorageProvider = ({
	children,
}: { children: ReactNode }) => {
	const [records, setRecords] = useState<NubeSDKStorageRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	/**
	 * Counts mutations the panel has applied. A snapshot that was already in
	 * flight when one landed is stale by definition, and discarding it is what
	 * keeps the poll from briefly reverting a value the page just wrote.
	 */
	const mutationSeq = useRef(0);

	const applyEvent = useCallback((event: NubeSDKStorageEvent) => {
		mutationSeq.current += 1;
		setRecords((previous) => {
			// `clear` carries no key and wipes the whole storage, so every
			// record the panel holds for that storage goes with it.
			if (event.method === "clear") {
				return previous.filter((record) => record.type !== event.type);
			}

			const id = recordId(event.type, event.key);

			if (event.method === "removeItem") {
				return previous.filter((record) => record.id !== id);
			}

			const next = toRecord(
				event.type,
				event.key,
				event.value ?? "",
				event.timestamp ?? Date.now(),
			);
			if (!next) return previous;

			const index = previous.findIndex((record) => record.id === id);
			if (index === -1) return [...previous, next];

			const updated = [...previous];
			updated[index] = next;
			return updated;
		});
	}, []);

	const refresh = useCallback(async () => {
		const seenMutations = mutationSeq.current;

		try {
			const entries = await readPageStorage();

			// A write landed while the page was being read. Its own event has
			// already updated the list with a value newer than anything this
			// read saw, so the read is dropped rather than applied.
			if (mutationSeq.current !== seenMutations) return;

			setRecords((previous) => reconcile(previous, entries));
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Collected here, in the provider, rather than in the Storages page: the
	// page unmounts whenever the panel navigates elsewhere, and a listener
	// living there misses every event dispatched in the meantime — including
	// the app storage writes that happen during page boot.
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name !== "nube-devtools-storage-events") return;

			port.onMessage.addListener((message) => {
				// One message carries a batch: the content script coalesces
				// bursts, which a page boot produces plenty of.
				const events = message.payload as NubeSDKStorageEvent[];
				if (Array.isArray(events)) {
					for (const event of events) {
						applyEvent(event);
					}
				}

				// One connection carries one batch, so the port has done its
				// job. Closing it here is what bounds the number of open ports
				// to the batches actually in flight.
				port.disconnect();
			});
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, [applyEvent]);

	useEffect(() => {
		refresh();

		// A reload keeps both storages but starts a fresh document, so the
		// list is rebuilt from the new page rather than carried across: an
		// entry the previous document held may simply not be there any more.
		let timer: ReturnType<typeof setTimeout> | null = null;
		const onNavigated = () => {
			setRecords([]);
			// Back to an unread state: the new document's storages have not
			// been looked at yet, which is not the same as being empty.
			setIsLoading(true);
			if (timer) clearTimeout(timer);
			timer = setTimeout(refresh, SNAPSHOT_AFTER_NAVIGATION_DELAY);
		};

		chrome.devtools?.network?.onNavigated?.addListener(onNavigated);

		return () => {
			if (timer) clearTimeout(timer);
			chrome.devtools?.network?.onNavigated?.removeListener(onNavigated);
		};
	}, [refresh]);

	const saveValue = useCallback(
		async (record: NubeSDKStorageRecord, value: string) => {
			const written = await setPageStorage(
				record.type,
				record.storageKey,
				value,
			);
			if (!written) return false;

			// The patched `setItem` echoes this write back as an event, but the
			// round trip through the page is not instant: applying it here
			// keeps the panel from showing the old value in the meantime. Both
			// paths converge on the same record.
			applyEvent({
				method: "setItem",
				type: record.type,
				key: record.storageKey,
				value,
				timestamp: Date.now(),
			});
			return true;
		},
		[applyEvent],
	);

	const removeRecord = useCallback(
		async (record: NubeSDKStorageRecord) => {
			const removed = await removePageStorage(record.type, record.storageKey);
			if (!removed) return false;

			applyEvent({
				method: "removeItem",
				type: record.type,
				key: record.storageKey,
				value: null,
				timestamp: Date.now(),
			});
			return true;
		},
		[applyEvent],
	);

	return (
		<NubeSDKStorageContext.Provider
			value={{ records, isLoading, refresh, saveValue, removeRecord }}
		>
			{children}
		</NubeSDKStorageContext.Provider>
	);
};

export const useNubeSDKStorage = () => {
	const context = useContext(NubeSDKStorageContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKStorage must be used within a NubeSDKStorageProvider",
		);
	}
	return context;
};
