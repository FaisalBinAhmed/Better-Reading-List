import { useEffect, useState } from "preact/hooks";
import ListItem from "./ListItem";

//dup for now

const STORE_LINK =
	"https://chromewebstore.google.com/detail/better-reading-list/dhadoebaijmhnilklfmbjnbfgbfmogln";

function openSettings() {
	chrome.runtime.openOptionsPage();
}

function openWebsite() {
	window.open(STORE_LINK, "_blank");
}

export type ReadingListItem = {
	title?: string;
	url?: string;
	hasBeenRead?: boolean;
};

type ItemFilterType = "all" | "unread" | "read";

const ReadingList = () => {
	// source of truth, not to be used directly
	const [listItems, setListItems] = useState<ReadingListItem[]>([]);

	// search results: filtered listItems based on search searchQuery
	const [searchResults, setSearchResults] = useState<ReadingListItem[]>([]);

	// whenever listItems change, update searchResults
	useEffect(() => {
		setSearchResults(listItems);
	}, [listItems]);

	const [itemType, setItemType] = useState<ItemFilterType>("all");

	useEffect(() => {
		fetchListItems();
	}, []);

	async function fetchListItems() {
		// @ts-ignore
		const items = (await chrome.readingList.query({})) as ReadingListItem[]; //until the API is available in the typedef
		setItemType("all");
		setListItems(items);
	}

	async function fetchUnreadItems() {
		// @ts-ignore
		const items = (await chrome.readingList.query({
			hasBeenRead: false
		})) as ReadingListItem[];
		setItemType("unread");
		setListItems(items);
	}

	async function fetchReadItems() {
		// @ts-ignore
		const items = (await chrome.readingList.query({
			hasBeenRead: true
		})) as ReadingListItem[];
		setItemType("read");
		setListItems(items);
	}

	function refreshListItems() {
		switch (itemType) {
			case "all":
				fetchListItems();
				break;
			case "unread":
				fetchUnreadItems();
				break;
			case "read":
				fetchReadItems();
				break;
		}
	}

	async function addCurrentTab() {
		const currentTab = await chrome.tabs.query({
			active: true,
			currentWindow: true
		});

		try {
			// @ts-ignore
			await chrome.readingList.addEntry({
				title: currentTab[0].title,
				url: currentTab[0].url,
				hasBeenRead: false
			});
		} catch (error) {}

		refreshListItems();
	}
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (searchQuery) {
			performSearch();
		} else {
			refreshListItems();
		}
	}, [searchQuery]);

	const performSearch = () => {
		const filteredItems = listItems.filter((item) => {
			if (item.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
				return true;
			}
			if (item.url?.toLowerCase().includes(searchQuery.toLowerCase())) {
				return true;
			}
			return false;
		});
		setSearchResults(filteredItems);
	};

	return (
		<div className="w-[320px] flex-col overflow-scroll max-h-[540px] p-2">
			<div className="flex flex-row justify-between items-center">
				<div className="font-bold flex flex-col text-base">
					<div className="text-white">Better</div>
					<div className="text-neutral-500 -mt-2">Reading List</div>
				</div>
				<div className="flex flex-row gap-1">
					<img
						src="/icons/heart.svg"
						alt="website"
						title="Visit website"
						className="w-6 h-6 cursor-pointer"
						onClick={openWebsite}
					/>

					<img
						src="/icons/cog.svg"
						alt="settings"
						title="Settings"
						className="w-6 h-6 cursor-pointer"
						onClick={openSettings}
					/>
				</div>
			</div>
			<div
				onClick={addCurrentTab}
				title="Add the current tab to the reading list"
				className="text-lg font-semibold text-neutral-200 bg-[#121212] p-2 my-2 text-center rounded cursor-pointer hover:text-[#a2de96]">
				Add this tab
			</div>
			<div className="flex flex-row items-center justify-between gap-2 my-2">
				<div className="flex flex-row gap-1 items-center">
					<img src="/icons/inbox.svg" alt="inbox" className="w-4 h-4" />
					<p className="text-[#737373]">{listItems.length}</p>
				</div>
				<div className="flex bg-[#121212] rounded flex-row p-2 gap-2">
					<button
						onClick={fetchListItems}
						className={itemType === "all" ? "text-white" : "text-neutral-400"}>
						All
					</button>
					<button
						onClick={fetchUnreadItems}
						className={
							itemType === "unread" ? "text-white" : "text-neutral-400"
						}>
						Unread
					</button>
					<button
						onClick={fetchReadItems}
						className={itemType === "read" ? "text-white" : "text-neutral-400"}>
						Read
					</button>
				</div>
			</div>
			<div className="mb-2">
				<input
					type="text"
					className="w-full p-2 bg-[#121212] text-white rounded focus:outline-none"
					placeholder="Search"
					value={searchQuery}
					onInput={(e) => {
						const value = e.currentTarget.value;
						setSearchQuery(value);
					}}
				/>
			</div>
			<div className="flex flex-col gap-1">
				{searchResults.map((item) => (
					<ListItem
						{...item}
						key={item.url}
						refreshHandler={refreshListItems}
					/>
				))}
			</div>
		</div>
	);
};

export default ReadingList;
