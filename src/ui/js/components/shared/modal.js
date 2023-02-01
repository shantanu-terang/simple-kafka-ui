import { Modal } from 'bootstrap'

export default {

    props: {
        title: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            backdrop: null
        }
    },
    expose: ["open", "close"],
    methods: {
        open() {
            const modal = new Modal(this.$refs.modal, {
                backdrop: 'static', focus: true, keyboard: true
            })
            this.$refs.modal.addEventListener('shown.bs.modal', (e) => {
                document.querySelector('body.modal-open').appendChild(e.target)
            })
            modal.show()
        },
        close() {
            this.$refs.closeButton.click()
        },
        submit() {
            this.$emit('submit', this.$refs.form)
        }
    },
    template: `
        <div class="modal fade" ref="modal" tabindex="-2"  aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5">{{ title }}</h1>
                        <button type="button" ref="closeButton" @click="$emit('closed')" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent ref="form"  autocomplete="off">
                            <slot name="body">
                                <div class="mb-3">
                                    <label for="demo" class="col-form-label">Demo:</label>
                                    <input type="text" class="form-control"
                                        id="demo">
                                </div>
                            </slot>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <slot name="footer">
                            <button type="button" ref="$emit('closed')" class="btn btn-secondary"
                                data-bs-dismiss="modal">Close</button>
                            <button type="button" @click="submit" class="btn btn-primary">Submit</button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    `
}