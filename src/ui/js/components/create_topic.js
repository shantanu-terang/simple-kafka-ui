import Modal from '/ui/js/components/shared/modal.js'

export default {
  components: {
    Modal
  },
  data() {
    return {
      form: {
        name: ""
      }
    }
  },
  methods: {
    openNewTopicModal() {
      this.form.name = ""
      this.$refs.modal.open()
    },
    async create(form) {
      const response = await this.$root.http().post('/api/topics', this.form)
      this.$emit("created", this.form)
      this.$refs.modal.close()

    }
  },
  template: `
      <a class="link-secondary vw-100 vv-100 me-2" @click="openNewTopicModal" href="#" aria-label="Add a new topic">
          <i class="bi bi-patch-plus"></i>
      </a>

      <Modal ref="modal" title="Create New Topic" @submit="create">
        <template v-slot:body>
          <div class="mb-3">
              <label for="name" class="col-form-label">Topic Name:</label>
              <input type="text" name="name" class="form-control" v-model="form.name" id="name">
          </div>
        </template>
      </Modal>
    `
}
