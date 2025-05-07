import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleXIcon } from "lucide-react";
import { useRef } from "react";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function SearchInput({
	value,
	onChange,
	placeholder = "Filter",
}: SearchInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<Input
				ref={inputRef}
				name="search"
				className={`
          h-5 ml-2 mr-1
          transition-all duration-500 ease-in-out
          overflow-hidden
          w-full
          text-[12px] md:text-[12px]
        `}
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
				onClick={(e) => e.currentTarget.select()}
			/>
			<Button
				disabled={value.length === 0}
				variant="ghost"
				size="icon"
				className="h-6 w-6"
				onClick={() => {
					onChange("");
					inputRef.current?.select();
				}}
			>
				<CircleXIcon className="size-3" />
			</Button>
		</>
	);
}
