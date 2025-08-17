import { useMemo } from "react";
import { useTopicState } from "../utils/useTopicState";


export function useTopicHook() {

    const topics = useTopicState((state) => state.topics);
    const messagesPerPage = useTopicState((state) => state.messagesPerPage);
    const currentTab = useTopicState((state) => state.currentTab);

    const currentTopic = useMemo(() => {
        if (!currentTab) return null
        // console.log(topics, 'topics');
        return topics[currentTab?.topic as string];
    }, [currentTab, topics]);

    const messages = useMemo(() => {
        if (!currentTopic) return [];
        return currentTopic?.messages || [];
    }, [currentTopic]);

    const searchQuery = useMemo(() => {
        return currentTopic?.searchQuery || '';
    }, [currentTopic]);

    const filteredMessages = useMemo(() => {
        if (!currentTopic) return [];
        if (!searchQuery) return messages;
        if (currentTopic.fuse) {
            const results = currentTopic.fuse.search(searchQuery);
            // console.log(results, 'results');
            return results.map(r => r.item);
        }
        return []
    }, [currentTopic, messages, searchQuery]);

    const totalPages = useMemo(() => {
        if (!currentTopic) return 0;
        return Math.ceil(filteredMessages.length / messagesPerPage);
    }, [filteredMessages, currentTopic, messagesPerPage]);

    // const paginatedMessages = useMemo(() => {
    //     if (!currentTab) return [];
    //     const start = (currentTab.currentPage - 1) * messagesPerPage;
    //     return filteredMessages.slice(start, start + messagesPerPage).map(msg => msg);
    // }, [filteredMessages, currentTab, messagesPerPage, ]);

    const isRealtimeEnabled = useMemo(() => {
        if (!currentTopic) return false;
        return currentTopic.isRealtimeEnabled;
    }, [currentTopic]);


    const loadedAndTotalMessages = useMemo(() => {
        const partition = currentTopic?.selectedPartition ?? 0;

        const offset = (currentTopic?.offsets || []).find(o => o.partition === partition);
        if (!offset) {
            return { loaded: messages.length, total: null}
        }

        return { loaded: messages.length, total: offset.total}

    }, [currentTopic, messages])


    const getPageOffset = (page: number = 1) => {

        const partition = currentTopic?.selectedPartition ?? 0;

        const offset = (currentTopic?.offsets || []).find(o => o.partition === partition);
        if (!offset) {
            return null
        }

        const startOffset = Number(offset.low);   // lowest offset available
        const endOffset = Number(offset.high);    // highest offset available

        const totalPages = Math.ceil(offset.total / messagesPerPage);


        const start = Math.max(endOffset - (page * messagesPerPage) + 1, startOffset) - 1; // -1 to adjust for 0-based index
        const end = Math.min(endOffset - ((page - 1) * messagesPerPage), endOffset) - 1; // -1 to adjust for 0-based index

        return { start: Math.abs(start - end) === 0 ? 0 : start, end: end <= -1 ? 0 : end, partition, limit: messagesPerPage, pages: totalPages, totalMessages: offset.total };
    }

    const realtimeTopics = useMemo(() => {
        if (!currentTopic) return [];
        const livetopics: string[] = []
        for (const topic of Object.values(topics)) {
            if (topic.isRealtimeEnabled) {
                livetopics.push(topic.name)
            }
        }
        return livetopics
    }, [currentTopic, topics])

    return {
        isRealtimeEnabled, totalPages, messagesPerPage, currentTopic, searchQuery, filteredMessages, currentTab, getPageOffset,
        allTopicMessages: messages, realtimeTopics, loadedAndTotalMessages
    }
}