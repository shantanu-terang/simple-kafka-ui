// import Fuse from "fuse.js";
import { useTopicState, type MessageType, type Offset } from "./useTopicState";

export async function loadTopics() {
    try {
        const response = await fetch('/api/topics');
        if (!response.ok) {
            throw new Error('Failed to fetch topics');
        }
        const data = await response.json();
        useTopicState.setState({ allTopics: data.result || [] });

        return true
    } catch (error) {
        console.error('Error fetching topics:', error);
        // useTopicState.setState({ allTopics: [] });
    }
    return false
}


export async function createTopic(topicName: string, numPartitions = 1, replicationFactor = 1) {
    try {
        const response = await fetch('/api/topics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: topicName,
                numPartitions: numPartitions,
                replicationFactor: replicationFactor
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to create topic');
        }

        const data = await response.json();
        console.log('Topic created successfully:', data);

        await loadTopics(); // Refresh the topic list after creation
        return true
    } catch (error) {
        console.error('Error creating topic:', error);
        throw error
    }
}

export async function fetchTopicOffsets(topic: string) {
    try {

        useTopicState.setState((state) => ({
            topics: {
                ...state.topics,
                [topic]: {
                    ...(state.topics[topic] || {
                        messages: [],
                        isRealtimeEnabled: false,
                        offsets: [],
                        isLoaded: false,
                        isLoading: true,
                        selectedPartition: -1, // should override this later !important
                        searchQuery: '',
                        fuse: null
                    }),
                    name: topic,
                    isLoading: true,
                }
            }
        }));

        const response = await fetch(`/api/topics/${topic}/offsets`);
        if (!response.ok) {
            throw new Error('Failed to fetch topic offsets');
        }
        const data = await response.json();

        useTopicState.setState((state) => {
            const offsets = (data.result || []).map((offset: Offset) => ({
                partition: Number(offset.partition),
                offset: Number(offset.offset),
                high: Number(offset.high),
                low: Number(offset.low),
                total: Number(offset.high) - Number(offset.low),
            }))
            return {
                topics: {
                    ...state.topics,
                    [topic]: {
                        ...state.topics[topic],
                        name: topic,
                        offsets,
                        isLoaded: true,
                        isLoading: false,
                        selectedPartition: state.topics[topic].selectedPartition === -1 ? offsets[0].partition : state.topics[topic].selectedPartition, // Maintain selected partition
                    }
                }
            }
        });
        return true
    } catch (error) {
        console.error('Error fetching topic offsets:', error);
    }
    return false
}


export async function produceMessage(topic: string, partition: number, message: string) {
    try {
        const response = await fetch(`/api/topics/${topic}/produce`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                partition,
                message
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to produce message');
        }
        await fetchTopicOffsets(topic); // Refresh offsets after producing a message

    } catch (error) {
        console.error('Error producing message:', error);
        throw error
    }
}

const mergeMessages = (stateMessages: MessageType[], newMessages: MessageType[]) => {
    const merged = [...stateMessages, ...newMessages];
    const uniqueOffsets = new Set();
    const mergedMap: { [offset: number]: MessageType } = {};
    merged.forEach((msg) => {
        const offset = Number(msg.offset)
        if (!uniqueOffsets.has(offset)) {
            uniqueOffsets.add(offset);
            mergedMap[offset] = msg
        }
    });

    const values = Object.values(mergedMap);

    // Sort by offset in descending order
    values.sort((a, b) => Number(b.offset) - Number(a.offset));
    // Limit the number of messages to the specified limit
    return values
}

export async function addNewMessage(topic: string, newMessages: MessageType[]) {
    useTopicState.setState((state) => {
        const messages = mergeMessages(state.topics[topic].messages, newMessages)
        return {
            topics: {
                ...state.topics,
                [topic]: {
                    ...state.topics[topic],
                    messages,
                    fuse: null,
                    isLoading: false,
                }
            }
        }
    });
    await fetchTopicOffsets(topic)
}



export async function fetchMessages(topic: string, partition: number, startOffset: number, endOffset: number) {
    try {
        // set is loading to true
        useTopicState.setState((state) => ({
            topics: {
                ...state.topics,
                [topic]: {
                    ...state.topics[topic],
                    isLoading: true,
                }
            }
        }));

        const response = await fetch(`/api/topics/${topic}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startOffset: startOffset,
                endOffset: endOffset,
                partition: partition
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to load messages');
        }


        const data = await response.json();

        addNewMessage(topic, data.result || [])

    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error; // Re-throw to handle in the calling function
    }
}