const BookRequests = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage">
        <h2 style="text-align: center;">Pending book requests</h2>
        <hr>
        <div style="text-align: center;">
          <table style="margin: auto;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 5px;">User</th>
                <th style="border: 1px solid black; padding: 5px;">Requested Book</th>
                <th style="border: 1px solid black; padding: 5px;">Approve</th>
                <th style="border: 1px solid black; padding: 5px;">Reject</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in pendingRequests" :key="request.id">
                <td style="border: 1px solid black; padding: 5px;">{{ request.user_id }}</td>
                <td style="border: 1px solid black; padding: 5px;">{{ request.book_id }}</td>
                <td style="border: 1px solid black; padding: 5px;">
                  <button type="submit" class="btn btn-success" @click="approveRequest(request.id)">Approve</button>
                </td>
                <td style="border: 1px solid black; padding: 5px;">
                  <button type="submit" class="btn btn-danger" @click="rejectRequest(request.id)">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
          <button class="btn btn-dark" @click="goBack">Back</button>
          <p v-if="errorMessage" style="color: red; text-align: center;">{{ errorMessage }}</p>
        </div>
      </div>
      </div>
    `,
  
    data() {
      return {
        requests: [],
        errorMessage: ''
      };
    },
  
    computed: {
      pendingRequests() {
        return this.requests.filter(request => request.status === "pending")
      }
    },
  
    mounted() {
      this.fetchRequests();
    },
  
    methods: {
      goBack() {
        this.$router.go(-1);
      },
  
      async fetchRequests() {
        try {
          const res = await fetch(`/book_requests`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          });
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to view these requests."

          } else if (res.ok) {
            const data = await res.json()
            console.log(data)
            this.requests = data.requests

          } else {
            console.log("Error in response")
          }

        } catch (error) {
          console.error("Error fetching data", error);
          this.errorMessage = "An error occurred while fetching the requests."
        }
      },
  
      async approveRequest(requestID) {
        try {
          const res = await fetch(`/approve_request/${requestID}`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          });
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to approve this request."

          } else if (res.ok) {
            const data = await res.json()
            this.fetchRequests()

          } else {
            console.log("Error in response")
          }

        } catch (error) {
          console.error("Error approving request", error)
          this.errorMessage = "An error occurred while approving the request."
        }
      },
  
      async rejectRequest(requestID) {
        try {
          const res = await fetch(`/reject_request/${requestID}`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          });
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to reject this request."

          } else if (res.ok) {
            const data = await res.json()
            this.fetchRequests()

          } else {
            console.log("Error in response")
          }

        } catch (error) {
          console.error("Error rejecting request", error);
          this.errorMessage = "An error occurred while rejecting the request."
        }
      }
    }
  };
  
  export default BookRequests
  