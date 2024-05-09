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

		async function fetchUnreadItem() {
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

		return (
			<div className="w-[300px] p-2">
				<div className="mx-2">Reading List</div>
				<div className="flex bg-black rounded flex-row p-2 gap-2 m-2">
					<button
						onClick={fetchListItems}
						className={itemType === "all" ? "text-white" : "text-neutral-400"}>
						All
					</button>
					<button
						onClick={fetchUnreadItem}
						className={
							itemType === "unread" ? "text-white" : "text-neutral-400"
						}>
						Unread
					</button>
				</div>
				<div className="flex flex-col gap-2 m-2">
					{listItems.map((item) => (
						<div className="flex flex-row bg-black p-2 gap-2 hover:bg-[#252525] rounded border border-white/[0.1]">
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
						</div>
					))}
				</div>
			</div>
		);
};

export default ReadingList;
