import createTopic from '/ui/js/components/create_topic.js'
import Loading from '/ui/js/components/shared/loading.js'

export default {
    components: {
        CreateTopic: createTopic, Loading
    },
    emits: ["created"],
    data() {
        return {
            searchTopic: '',
            topics: [],
            selectedTopic: '',
            isLoading: false
        }
    },
    computed: {
        filteredTopics() {
            return this.topics.filter(topic => topic.toLowerCase().includes(this.searchTopic.toLowerCase()))
        }
    },
    methods: {
        async selectTopic(topic) {
            if (topic == this.selectedTopic) return
            this.selectedTopic = topic
            this.$emit('topic', topic)
        },
        async loadTopics() {
            this.isLoading = true
            const topics = await this.$root.http().get('/api/topics')
            this.topics = topics.data.result
            this.isLoading = false
        }
    },
    async created() {
        await this.loadTopics()
    },

    template: `
    <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
        <div class="position-sticky pt-3 sidebar-sticky">
            <h6
                class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted text-uppercase">
                <span>topics</span>
                <div>
                    <CreateTopic @created="(d) => loadTopics()"/>
                    <a class="link-secondary vw-100 vv-100" @click="loadTopics" href="#" aria-label="Refresh">
                        <i class="bi bi-arrow-repeat"></i>
                    </a>
                </div>
            </h6>
            <div class="form-group  ms-2 me-2">
                <input type="text" class="form-control" v-model="searchTopic">
            </div>
            <Loading v-if="isLoading" class="mt-2 mb-2"/>
            <ul class="nav flex-column" v-if="!isLoading">
                <li class="nav-item" v-for="(topic, index) in filteredTopics">
                    <a class="nav-link" :class="{active: selectedTopic == topic}"
                        v-on:click="selectTopic(topic)" aria-current="page" href="#">
                        <span data-feather="home" class="align-text-bottom"></span>
                        {{topic}}
                    </a>
                </li>
                <li class="nav-item" v-if="filteredTopics.length==0">
                    <a class="nav-link" href="#">
                        No Topics
                    </a>
                </li>
            </ul>
        </div>
    </nav>
    `
}