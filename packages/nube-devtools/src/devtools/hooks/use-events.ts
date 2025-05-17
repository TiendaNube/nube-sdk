import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import type { NubeSDKEvent, NubeSDKEventData } from "@/contexts/nube-sdk-events-context";

const SEARCH_STORAGE_KEY = "nube-devtools-filter-search";

export function useEvents() {
  const [selectedEvent, setSelectedEvent] = useState<NubeSDKEvent | null>(null);
  const { events, setEvents, clearEvents } = useNubeSDKEventsContext();
  const [filteredEvents, setFilteredEvents] = useState<NubeSDKEvent[]>([]);
  const [search, setSearch] = useState(() => {
    return localStorage.getItem(SEARCH_STORAGE_KEY) || "";
  });

  useEffect(() => {
    setFilteredEvents(events.filter((event) => event.data[1].includes(search)));
  }, [events, search]);

  useEffect(() => {
    localStorage.setItem(SEARCH_STORAGE_KEY, search);
  }, [search]);

  useEffect(() => {
    const listener = (port: chrome.runtime.Port) => {
      if (port.name === "nube-devtools-events") {
        port.onMessage.addListener((message) => {
          if (message.payload as NubeSDKEventData) {
            setEvents((prevEvents) => {
              return [...prevEvents, { id: uuidv4(), data: message.payload }];
            });

            port.disconnect();
          }
        });
      }
    };

    chrome.runtime.onConnect.addListener(listener);

    return () => {
      chrome.runtime.onConnect.removeListener(listener);
    };
  }, [setEvents]);

  const handleClearList = () => {
    setSelectedEvent(null);
    clearEvents();
  };

  const handleReplayEvent = (event: NubeSDKEventData) => {
    chrome.runtime.sendMessage(
      {
        action: "nube-devtools-replay-event",
        payload: {
          tabId: chrome.devtools.inspectedWindow.tabId,
          state: event[0],
          event: event[1],
          appId: event[2],
        },
      },
      (response: { status: boolean }) => {
        if (response.status) {
          toast.success("Event resent successfully");
        } else {
          toast.error("Failed to resend event");
        }
      },
    );
  };

  const hasHiddenEvents = filteredEvents.length === 0 && events.length !== filteredEvents.length;

  return {
    selectedEvent,
    setSelectedEvent,
    events,
    filteredEvents,
    search,
    setSearch,
    handleClearList,
    handleReplayEvent,
    hasHiddenEvents,
  };
}
