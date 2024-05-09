import { useEffect, useState } from "preact/hooks";

type ReadingListItem = {
	title?: string;
	url?: string;
	hasBeenRead?: boolean;
};

function getUrlDomain(url?: string) {
	if (!url) {
		return "";
	}
	const urlObj = new URL(url);
	return urlObj.hostname;
}

const ReadingList = () => {
	const [listItems, setListItems] = useState<ReadingListItem[]>([]);
	const [itemType, setItemType] = useState<"all" | "unread">("all");

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

	function getFaviconUrl(link?: string) {
		// return `https://www.google.com/s2/favicons?domain=${url}&sz=128`; // this will throw third party cookies warning

		if (!link) {
			return;
		}

		const url = new URL(chrome.runtime.getURL("/_favicon/"));
		url.searchParams.set("pageUrl", link);
		url.searchParams.set("size", "128");
		return url.toString();
	}

	function openUrl(url?: string) {
		window.open(url, "_blank");
	}

	async function deleteItem(url?: string) {
		if (!url) {
			return;
		}
		// @ts-ignore
		await chrome.readingList.removeEntry({ url });

		// todo: update the listItems state to reflect the change instead of refetching
		if (itemType === "all") {
			fetchListItems();
		} else {
			fetchUnreadItems();
		}
	}

	async function addCurrentTab() {
		const currentTab = await chrome.tabs.query({
			active: true
		});

		// @ts-ignore
		chrome.readingList.addEntry({
			title: currentTab[0].title,
			url: currentTab[0].url,
			hasBeenRead: false
		});
	}

	return (
		<div className="w-[300px] p-2">
			<div className="mx-2 text-xl">Reading List</div>
			<div
				onClick={addCurrentTab}
				className="text-lg bg-black p-4 my-2 text-center cursor-pointer">
				Add current tab to list
			</div>
			<div className="flex bg-black rounded items-end flex-row p-2 gap-2 my-2">
				<button
					onClick={fetchListItems}
					className={itemType === "all" ? "text-white" : "text-neutral-400"}>
					All
				</button>
				<button
					onClick={fetchUnreadItems}
					className={itemType === "unread" ? "text-white" : "text-neutral-400"}>
					Unread
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{listItems.map((item) => (
					<div
						onClick={() => openUrl(item.url)}
						className="flex flex-row bg-black cursor-pointer p-2 gap-2 hover:bg-[#252525] rounded border border-white/[0.1]">
						<img
							src={getFaviconUrl(item.url)}
							alt="favicon"
							className="w-8 h-8"
						/>
						<div className="flex-1 flex flex-col gap-1">
							<div className="line-clamp-2">{item.title}</div>
							<div className="text-neutral-400 text-xs">
								{getUrlDomain(item.url)}
							</div>
						</div>
						<div>
							<img
								src="/icons/trash.svg"
								alt="delete"
								className="w-4 h-4"
								onClick={(e) => {
									e.stopPropagation();
									deleteItem(item.url);
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ReadingList;
