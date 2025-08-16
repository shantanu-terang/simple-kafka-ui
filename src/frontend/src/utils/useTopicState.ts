import type Fuse from 'fuse.js'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'


export type TabType = {
  topic: string
  loading: boolean
  expandedRows: Set<number>
  currentPage: number
}

export type Offset = {
  partition: number;
  offset: string;
  high: string;
  low: string;
  total: number;
}

export type MessageType = {
  offset: string | number
  partition: number
  message: string
  key: string | null
  topic: string
  timestamp: string
  from_now: string
}

type TopicState = {
  allTopics: string[]
  topics: Record<string, {
    name: string
    offsets: Offset[]
    messages: MessageType[]
    isRealtimeEnabled: boolean
    selectedPartition: number
    searchQuery: string
    isLoaded: boolean
    isLoading: boolean
    fuse: Fuse<MessageType> | null
  }>
  messagesPerPage: number
  tabs: TabType[]
  currentTab: TabType | null
  activeTabIndex: number
  theme: string
  isSocketConnected: boolean
};

export const useTopicState = create<TopicState>()(
  persist((): TopicState => ({
    allTopics: [],
    topics: {},
    messagesPerPage: 15,
    tabs: [],
    currentTab: null,
    activeTabIndex: -1,
    theme: 'light',
    isSocketConnected: false,
  }), {
    name: 'topic-state',
    storage: createJSONStorage(() => localStorage),
    partialize: state => ({
      messagesPerPage: state.messagesPerPage,
      theme: state.theme
    })
  })
)