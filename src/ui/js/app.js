import axios from 'axios'
import { Toast } from 'bootstrap'
import { createApp } from '/npm/vue/dist/vue.esm-browser.js'
import Header from '/ui/js/components/shared/header.js'
import Sidebar from '/ui/js/components/shared/sidebar.js'
import DashboardHeading from '/ui/js/components/dashboard_heading.js'
import DashboardFilter from '/ui/js/components/dashboard_filter.js'
import Socket from '/ui/js/socket.js'
import Loading from '/ui/js/components/shared/loading.js'

createApp({
    components: {
        Header,
        Sidebar,
        DashboardHeading,
        DashboardFilter,
        Loading,
    },
    emits: ['topic', 'loadMessages', 'reloadTopic', 'newMessage'],
    data() {
        return {
            appName: 'Simple Kafka UI',
            topicName: '',
            offsets: [],
            messages: [],
            isLoadingOffsets: false,
            isLoadingMessages: false,
            toast: {
                title: "Info",
                message: "",
                type: "error" // success info
            }
        }
    },
    methods: {
        http() {
            const instance = axios.create({
                baseURL: window.location.origin
            })

            instance.interceptors.response.use((response) => {
                if (!response.data.success) {
                    this.showToast( response.data['type'] ? response.data.type : 'Error' , response.data.message, 'error')
                } else {
                    if (response.data.message)
                    this.showToast('' , response.data.message, 'info')
                }
                return response;
              }, (error) => {
                if (error.response.data) {
                    const data = error.response.data
                    this.showToast( data['type'] ? data.type : 'Error' , data.message, 'error')
                } else {
                    this.showToast( error?.code ?? 'Error' , error.message, 'error')
                }
                return Promise.reject(error);
              });

            return instance
        },
        showToast(title="", message="", type="info") {
            this.toast.title = title
            this.toast.message = message
            this.toast.type = type
            const toast = Toast.getOrCreateInstance(this.$refs.toast)
            toast.show()
        },
        gotNewMessage(message) {
            this.messages.splice(0, 0, message)
        },
        reloadTopic() {
            this.loadOffsets()
        },
        topicChanged(topic) {
            this.messages = []
            this.offsets = []
            this.topicName = topic
            this.loadOffsets()
        },

        async loadOffsets() {
            this.isLoadingOffsets = true
            const offsets = await this.http().get(`/api/topics/${this.topicName}/offsets`)
            this.offsets = offsets.data.result
            this.isLoadingOffsets = false
        },

        async loadMessages(formData) {
            this.isLoadingMessages = true
            this.messages = []
            const messages = await this.http().post(`/api/topics/${this.topicName}/messages`, formData)
            this.messages = messages.data.result
            this.isLoadingMessages = false
        },
    },
    created() {
        Socket.connect()
    },
    beforeUnmount() {
        Socket.disconnect();
    },
    template: `
        <div>
            
        <Header :appName="appName"/>

        

        <div class="container-fluid">
            <div class="row">
                <Sidebar @topic="topicChanged"/>

                <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">

                <div :class="{'toast-container top-0 end-0': true }">
                    <div :class="{toast: true, 'text-bg-danger': (toast.type == 'error'), 'text-bg-success': (toast.type == 'success'), 'text-bg-info': (toast.type == 'info') }" ref="toast" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="toast-header">
                            <i class="bi bi-info-circle-fill"></i>
                            <strong class="me-auto"> {{ this.toast.title }}</strong>
                            <!--<small class="text-muted">just now</small>-->
                            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                            {{ toast.message }}
                        </div>
                    </div>
                </div>

                    <DashboardHeading :isLoadingOffsets="isLoadingOffsets" :topicName="topicName" @reloadTopic="reloadTopic" :offsets="offsets"/>

                    <DashboardFilter :isLoadingMessages="isLoadingMessages" :isLoadingOffsets="isLoadingOffsets" :topicName="topicName" :offsets="offsets" @loadMessages="loadMessages" @newMessage="gotNewMessage"/>
                    <hr v-if="topicName.length"/>
                    <Loading v-if="isLoadingMessages"/>
                    <div v-if="!isLoadingMessages && offsets.length && topicName.length && messages.length" class="table-responsive">
                        <table class="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th style="width: 150px;" scope="col">Time</th>
                                    <th scope="col">message</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(message, index) in messages" :key="index">
                                    <td style="width: 150px;" scope="col">{{ message.from_now }}</td>
                                    <td scope="col">{{ message.message }}</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>

    </div>
    `
}).mount('#app')