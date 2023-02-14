import axios from 'axios'
import { Toast } from 'bootstrap'
import { createApp } from '/npm/vue/dist/vue.esm-browser.js'
import Header from '/ui/js/components/shared/header.js'
import Sidebar from '/ui/js/components/shared/sidebar.js'
import DashboardHeading from '/ui/js/components/dashboard_heading.js'
import DashboardFilter from '/ui/js/components/dashboard_filter.js'
import Socket from '/ui/js/socket.js'
import Loading from '/ui/js/components/shared/loading.js'
import Modal from '/ui/js/components/shared/modal.js'
// import { VueJsonPretty } from '/npm/vue-json-pretty/lib/vue-json-pretty.js';
// import VueJsonPretty from 'vue-json-pretty';


createApp({
    components: {
        // VueJsonPretty,
        Header,
        Sidebar,
        DashboardHeading,
        DashboardFilter,
        Loading,
        Modal
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
            },
            selectedMessage: null,
            showMsgPreview: true,
            messageFilter: {
                f1: '', f2: '', f3: ''
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
            // check if offset is in message
            if (!this.messages.some(msg => msg.offset == message.offset)) {
                this.messages.splice(0, 0, message)
            }
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

        viewJson(message) {
            // console.log(message)
            this.showMsgPreview = false
            this.selectedMessage = { ...message }
            this.selectedMessage['raw_message'] = JSON.stringify(JSON.parse(message.message), null, 4)
            this.selectedMessage.message = this.jsonViewer(JSON.parse(message.message), false)
            this.$refs.modal.open()
        },
        jsonViewer(json, collapsible=false) {
            const TEMPLATES = {
                item: '<div class="json__item"><div class="json__key">%KEY%</div><div class="json__value json__value--%TYPE%">%VALUE%</div></div>',
                itemCollapsible: '<label class="json__item json__item--collapsible"><input type="checkbox" class="json__toggle"/><div class="json__key">%KEY%</div><div class="json__value json__value--type-%TYPE%">%VALUE%</div>%CHILDREN%</label>',
                itemCollapsibleOpen: '<label class="json__item json__item--collapsible"><input type="checkbox" checked class="json__toggle"/><div class="json__key">%KEY%</div><div class="json__value json__value--type-%TYPE%">%VALUE%</div>%CHILDREN%</label>'
            }
        
            function createItem(key, value, type){
                var element = TEMPLATES.item.replace('%KEY%', key);
        
                if(type == 'string') {
                    element = element.replace('%VALUE%', '"' + value + '"');
                } else {
                    element = element.replace('%VALUE%', value);
                }
        
                element = element.replace('%TYPE%', type);
        
                return element;
            }
        
            function createCollapsibleItem(key, value, type, children){
                var tpl = 'itemCollapsible';
                
                if(collapsible) {
                    tpl = 'itemCollapsibleOpen';
                }
                
                var element = TEMPLATES[tpl].replace('%KEY%', key);
        
                element = element.replace('%VALUE%', type);
                element = element.replace('%TYPE%', type);
                element = element.replace('%CHILDREN%', children);
        
                return element;
            }
        
            function handleChildren(key, value, type) {
                var html = '';
        
                for(var item in value) { 
                    var _key = item,
                        _val = value[item];
        
                    html += handleItem(_key, _val);
                }
        
                return createCollapsibleItem(key, value, type, html);
            }
        
            function handleItem(key, value) {
                var type = value == null ? null : Array.isArray(value) ? `Array(${value.length})` : typeof value;
        
                if(typeof value === 'object') {        
                    return handleChildren(key, value, `${type}`);
                }
        
                return createItem(key, value, type);
            }
        
            function parseObject(obj) {
                let _result = '<div class="json">';
        
                for(var item in obj) { 
                    var key = item,
                        value = obj[item];
        
                    _result += handleItem(key, value);
                }
        
                _result += '</div>';
        
                return _result;
            }
            
            return parseObject(json);
        }
        
        
    },
    computed: {
        filteredMessages() {
            return this.messages
                .filter(msg => msg.message.toLowerCase().includes(this.messageFilter.f1.toLowerCase()))
                .filter(msg => msg.message.toLowerCase().includes(this.messageFilter.f2.toLowerCase()))
                .filter(msg => msg.message.toLowerCase().includes(this.messageFilter.f3.toLowerCase()))
        }
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
                        <div class="input-group mb-3">
                            <span class="input-group-text">Filter 1:</span>
                            <input type="text" class="form-control" v-model="messageFilter.f1" placeholder='"action":"create"' aria-label="Username">
                            <span class="input-group-text">Filter 2:</span>
                            <input type="text" class="form-control" v-model="messageFilter.f2" placeholder='"id":"124"' aria-label="Server">
                            <span class="input-group-text">Filter 3:</span>
                            <input type="text" class="form-control" v-model="messageFilter.f3" placeholder='"success":true' aria-label="Server">
                        </div>
                        <table class="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th style="width: 150px;" scope="col">Offset</th>
                                    <th style="width: 200px;" scope="col">Timestamp</th>
                                    <th scope="col">message</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(message, index) in filteredMessages" :key="index">
                                    <td style="width: 150px;" scope="col">
                                    <strong>#{{ message.offset }}</strong>
                                    <br/>
                                    <button type="button" class="btn btn-primary btn-sm" v-on:click="viewJson(message)">View</button>
                                </td>
                                    <td style="width: 200px;" scope="col">{{ message.timestamp }}</td>
                                    <td scope="col">{{ message.message }}</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                    <Modal ref="modal" :lg="true" :title="'View Message #' + selectedMessage?.offset??''" @submit.prevent>
                        <template v-slot:body>
                            <button type="button" v-on:click="showMsgPreview = !showMsgPreview" class="btn btn-info btn-sm">Toggle <span v-if="showMsgPreview">Raw</span><span v-else>Preview</span> JSON</button>
                            <template v-if="showMsgPreview">
                                <code v-html="selectedMessage?.message??''">...</code>
                            </template>
                            <template v-else>
                                <textarea class="form-control mt-2" style="height: 600px">{{selectedMessage?.raw_message??''}}</textarea>
                            </template>
                        </template>
                        <template v-slot:footer>
                        <button type="button" class="btn btn-secondary"
                            data-bs-dismiss="modal">Close</button>
                        </template>
                    </Modal>
                </main>
            </div>
        </div>

    </div>
    `
}).mount('#app')