const ExportCSV = {
    template:
    `
    <div>
    <button v-if="download" @click="triggerDownload">Download CSV</button>
    </div>
    `,

    data() {
        return {
            taskId: null,
            download: ''
        }
    },

    created() {
        this.startExport()
    },

    methods: {
        startExport() {

          fetch('/start-export')
            .then(response => response.json())
            .then(data => {
              this.taskId = data.task_id;
              this.download = `/get-csv/${this.taskId}`; 
            })
            .catch(error => console.error('Error starting export:', error));
        },
        triggerDownload() {
          if (this.download) {
            window.location.href = this.download;
            this.download = null;
            this.$router.push('/admin_dashboard')
          }
        }
      }
}

export default ExportCSV