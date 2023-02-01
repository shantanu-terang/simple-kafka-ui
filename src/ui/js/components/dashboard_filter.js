import Socket from '/ui/js/socket.js'
import Loading from '/ui/js/components/shared/loading.js'

export default {
    components: {
        Loading
    },
    props: {
        isLoadingMessages: {
            type: Boolean,
            default: false
        },
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
    watch: {
        offsets(newVal, oldVal) {
            if (!newVal.some(item => item.partition == this.form.partition)) {
                // select first partition
                if (newVal.length) {
                    this.form.partition = newVal[0].partition
                } else {
                    this.form.partition =0
                }
            }
        },
        isRealTimeEnabled(n, o) {
            this.toggleRealtime()
        },
        topicName(n, o) {
            this.isRealTimeEnabled = false
        }
    },
    data() {
        return {
            form: {
                offset: 0,
                partition: 0
            },
            isRealTimeEnabled: false
        }
    },
    methods: {
        async loadMessages(e) {
            this.$emit('loadMessages', this.form)
        },
        async toggleRealtime() {
            console.log("Realtime: ", this.isRealTimeEnabled)
            if (this.isRealTimeEnabled) {
                // consume messages
                Socket.emit("start_consumer", { topic: this.topicName })
                Socket.on(`message_${this.topicName}`, (data) => {
                    if (data.success) {
                        this.$emit('newMessage', data.result)
                    } else {
                        console.log(data)
                    }
                })
            } else {
                // stop consumer
                Socket.socket.off(`message_${this.topicName}`)
                Socket.emit("stop_consumer", { topic: this.topicName })
            }
        }
    },
    computed:{
        canLoadMessages() {
            return !this.loadOptions.some(item => item.value == this.form.offset)
        },
        loadOptions() {
            const options = []

            if (this.offsets.length) {
                const offset = this.offsets.find(item => item.partition == this.form.partition)
                const high = Number(offset.high)
                const low = Number(offset.low)
                const total = high - low
                const limit = 5

                if (total == 0) return []

                if (total <= limit) {
                    options.push({
                        value: low,
                        message: `${total} message(s)`
                    })
                    return options
                }
                const pages = Math.ceil(total/limit)
                for (let i = 1; i < pages + 1; i++) {
                    if (i >= 10) break
                    let fromOffset = high - (i * limit)
                    let message = `${limit * i} messages`
                    if (i == pages) {
                        fromOffset = low
                        message = `${total} messages (all)`
                    }
                    options.push({
                        value: fromOffset,
                        message
                    })
                }
                this.form.offset = options[0].value
            }
            return options
        }
    },
    template: `
    <div v-if="topicName!=''">
        <Loading v-if="isLoadingOffsets"/>
        <form v-else class="row row-cols-lg-auto g-3 align-items-center" v-on:submit.prevent="loadMessages" autocomplete="off">
            <div class="col-12">
                <div class="input-group">
                    <label class="input-group-text" for="partition">Select Partition</label>
                    <select class="form-select" v-model="form.partition" id="partition">
                        <option v-for="offset in offsets" :value="offset.partition">Partition {{ offset.partition }} - {{ Number(offset.high) - Number(offset.low)  }} message(s)</option>
                    </select>
                </div>
            </div>

            <div class="col-12">
                <div class="input-group">
                    <label class="input-group-text" for="offset">Show Last</label>
                    <select class="form-select" v-model="form.offset" id="offset">
                        <option :value="offset.value" v-for="offset in loadOptions">{{ offset.message }}</option>
                    </select>
                </div>
            </div>


            <div class="col-12">
                <button type="submit" :class="{'btn': true, 'btn-primary': true, 'disabled': (canLoadMessages || isLoadingMessages) }">Load Messages</button>
            </div>

            <div class="col-12">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="realtime" 
                        :true-value="true"
                        :false-value="false"
                        v-model="isRealTimeEnabled"
                    >
                    <label class="form-check-label" for="realtime">Realtime Messages</label>
                </div>
            </div>
        </form>
    </div>
    `
}