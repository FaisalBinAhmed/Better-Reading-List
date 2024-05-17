import { useEffect, useState } from "preact/hooks";

//dup for now

type StorageKey = "autoRead";

const STORE_LINK =
	"https://chromewebstore.google.com/detail/better-reading-list/dhadoebaijmhnilklfmbjnbfgbfmogln";

export async function getOneStorageItem(itemKey: StorageKey) {
	try {
		return chrome.storage.sync.get(itemKey);
	} catch (error) {}
}

export async function setOneStorageObject(
	itemKey: StorageKey,
	value: boolean | number | string
) {
	try {
		chrome.storage.sync.set({ [itemKey]: value });
	} catch (error) {}
}

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

type ItemFilterType = "all" | "unread" | "read";

const ReadingList = () => {
	const [listItems, setListItems] = useState<ReadingListItem[]>([]);
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
		markReadIfNeeded(url);
		window.open(url, "_blank");
	}

	async function markReadIfNeeded(url?: string) {
		const value = await getOneStorageItem("autoRead");

		if (value?.autoRead) {
			changeReadStatus(url, true);
		}
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

	async function deleteItem(url?: string) {
		if (!url) {
			return;
		}
		// @ts-ignore
		await chrome.readingList.removeEntry({ url });

		// todo: update the listItems state to reflect the change instead of refetching
		refreshListItems();
	}

	async function addCurrentTab() {
		const currentTab = await chrome.tabs.query({
			active: true
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

	async function changeReadStatus(url?: string, hasBeenRead?: boolean) {
		if (!url) {
			return;
		}

		// @ts-ignore
		await chrome.readingList.updateEntry({
			url,
			hasBeenRead
		});
		//temp todo:
		refreshListItems();
	}

	function openSettings() {
		chrome.runtime.openOptionsPage();
	}

	function openWebsite() {
		window.open(STORE_LINK, "_blank");
	}

	return (
		<div className="w-[320px] flex-col overflow-scroll max-h-[500px] p-2">
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
			<div className="flex flex-col gap-1">
				{listItems.map((item) => (
					<div
						onClick={() => openUrl(item.url)}
						key={item.url}
						href={item.url}
						title={item.title}
						target={"_blank"}
						className="flex flex-row bg-[#121212] cursor-pointer  p-3 gap-3 hover:bg-[#252525] rounded  border-white/[0.1]">
						<div className="items-start flex">
							<img
								src={getFaviconUrl(item.url)}
								alt="favicon"
								className="w-8 h-8 bg-[#252525] p-2 rounded"
							/>
						</div>
						<div className="flex-1 flex items-start flex-col gap-1 ">
							<div className="line-clamp-2">{item.title}</div>
							<div className="text-neutral-400 text-xs">
								{getUrlDomain(item.url)}
							</div>
						</div>
						<div className="flex flex-row gap-2 items-start">
							{item.hasBeenRead ? (
								<img
									src="/icons/envelope-open.svg"
									alt="unread"
									title={"Mark as unread"}
									className="w-4 h-4"
									onClick={(e) => {
										e.stopPropagation();
										changeReadStatus(item.url, false);
									}}
								/>
							) : (
								<img
									src="/icons/envelope.svg"
									alt="read"
									title={"Mark as read"}
									className="w-4 h-4"
									onClick={(e) => {
										e.stopPropagation();
										changeReadStatus(item.url, true);
									}}
								/>
							)}

							<img
								src="/icons/trash.svg"
								alt="delete"
								title={"Delete"}
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
