import Modal from '/ui/js/components/shared/modal.js'
import Loading from '/ui/js/components/shared/loading.js'

export default {
    components: {
        Modal, Loading
    },
    props: {
        isLoadingOffsets: {
            type: Boolean,
            default: false
        },
        topicName: {
            type: String, 
            required: true
        },
        offsets: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            form: {
                partition: 0,
                message: ''
            },
            consumers: [],
            isLoadingGroups: false
        }
    },
    methods: {
        async showTopicDetails() {
            this.isLoadingGroups = true
            this.$refs.consumer_modal.open()
            this.$forceUpdate()
            const response = await this.$root.http().get(`/api/topics/${this.topicName}/details`)
            this.consumers = response.data.result
            this.isLoadingGroups = false
            this.$forceUpdate()


        },
        reloadTopic() {
            this.$emit("reloadTopic")
        },
        openProduceModal(e) {
            this.form.message = ''

            if (!this.offsets.some(item => item.partition == this.form.partition)) {
                // select first partition
                if (this.offsets.length) {
                    this.form.partition = this.offsets[0].partition
                } else {
                    this.form.partition =0
                }
            }

            this.$refs.modal.open()
        },
        async produceNewMessage() {
            const response = await this.$root.http().post(`/api/topics/${this.topicName}/produce`, this.form)
            console.log(response.data)
            this.$refs.modal.close()
        }
    },
    template: `
    <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <template v-if="topicName == ''">
            <h1 class="h2">Select a topic first</h1>
        </template>
        <template v-else>
            <h1 class="h2">{{ topicName }}</h1>
        </template>
        
        <div class="btn-toolbar mb-2 mb-md-0" v-if="topicName.length">
            <Loading v-if="isLoadingOffsets"/>
            <div v-else class="btn-group me-2">
                <button type="button" @click="reloadTopic" class="btn btn-sm btn-outline-info">Reload Topic</button>
                <button type="button" @click="showTopicDetails" class="btn btn-sm btn-outline-secondary">Consumers</button>
                <button type="button" @click="openProduceModal" class="btn btn-sm btn-outline-primary">Produce New Message</button>
                <button type="button" class="btn btn-sm btn-outline-danger">Delete Topic</button>
            </div>
        </div>

        <Modal ref="modal" title="Produce New Message" @submit="produceNewMessage">
            <template v-slot:body>
                <div class="mb-3">
                    <label for="recipient-name" class="col-form-label">Partition:</label>
                    <select class="form-select" v-model="form.partition" id="partition">
                        <option v-for="offset in offsets" :value="offset.partition">Partition - {{ offset.partition }}</option>
                    </select>
                    
                </div>
                <div class="mb-3">
                    <label for="message-text" class="col-form-label">Message:</label>
                    <textarea class="form-control" v-model="form.message"
                        id="message-text"></textarea>
                </div>
            </template>
        </Modal>

        <Modal ref="consumer_modal" title="Stable consumers list">
            <template v-slot:body>
                <Loading v-if="isLoadingGroups"/>
                <template v-else>
                    <div class="list-group">
                        <button type="button" v-for="g in consumers" class="list-group-item list-group-item-action" aria-current="true">
                            {{ g.groupId }} ({{g.members.length}} members)
                        </button>
                        <button type="button" v-if="consumers.length == 0" class="list-group-item list-group-item-action disabled" aria-current="true">
                            No consumer connected
                        </button>
                    </div>
                </template>
            </template>
            <template v-slot:footer>
                <button type="button" class="btn btn-secondary"
                data-bs-dismiss="modal">Close</button>
            </template>
        </Modal>
    </div>
    `
}