document.addEventListener("DOMContentLoaded", function () {
    let isUpdateMode = false; // Track mode state
    const toggleButton = document.getElementById("editBtn");
    const tableBody = document.querySelector(".table_body");
    const successMsg =document.getElementById('successMsg');

    // Fetch and load data based on mode
    async function loadTableData() {
        try {
            let response = await fetch("/admin/report");
            let data = await response.json();
            tableBody.innerHTML = ""; // Clear table before loading new data
            console.log(data)
            data.forEach((item) => {
                let row = document.createElement("tr");

                row.setAttribute('class', 'rowData');
                 row.setAttribute('class','rowData');
                 row.style.borderBottomWidth = '1px';
                 row.style.borderColor = '#eab308';
                 row.innerHTML = `
                    <td class="bg-gray-800 text-white p-2 text-center">${item.Audit_id}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.auditor_id}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.auditor_name}</td>
                    <td class="bg-gray-800 text-white p-2 text-center ">${item.audit_type}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.planned_date}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.contact}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.email}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.client_id}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.state}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.location}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.payment_amount}</td>
                    <td class="paymentColor" data-field="payment_status" ${isUpdateMode ? ' data-id="'+ item.auditor_id + '"'  : ''}>${item.payment_status}</td>
                    <td class="StatusColor" data-field="status" ${isUpdateMode ? 'data-id="' + item.auditor_id + '"' : ''} >${item.audit_status}</td>
                `;

                tableBody.appendChild(row);
            });

            // Add event listeners for updating only in update mode
            if (isUpdateMode) {
                enableEditing();
            }
        } catch (error) {
            console.error("Error fetching audit data:", error);
        }
    }

    // Function to enable content editing
   function enableEditing() {
     tableBody.addEventListener("click", function (event) {
        let td = event.target;

        // Check if the clicked element is a cell and has 'data-field' attribute
        if (td.tagName === "TD" && td.hasAttribute("data-field")) {
            let auditId = td.getAttribute("data-id");
            let fieldType = td.getAttribute("data-field");
            let currentValue = td.textContent.trim();

            // Create a <select> dropdown
            let select = document.createElement("select");
            let options = fieldType === "status"
                ?["Completed", "Pending", "In Progress"] // Example statuses
                :["Paid","Unpaid","Requested"];  // Example payment statuses

            options.forEach(option => {
                let opt = document.createElement("option");
                opt.value = option;
                opt.textContent = option;
                if (option === currentValue) opt.selected = true;
                select.appendChild(opt);
            });

            // Replace text with the select dropdown
            td.innerHTML = "";
            td.appendChild(select);
            select.focus();

            // When the selection changes, update the data
            select.addEventListener("change", async function () {
                let newStatus = this.value.trim();


                if (auditId && newStatus) {
                    if (fieldType === "status") {
                        await updateStatus(auditId, newStatus);
                    } else if (fieldType === "payment_status") {
                        await paymentUpdate(auditId, newStatus);
                    }
                }

                // Restore the updated text inside the <td>
                td.textContent = newStatus;
            });

            // On losing focus, restore text value
            select.addEventListener("blur", function () {
                td.textContent = currentValue;
            });
        }
     });
   }


    // Function to send update audit request
    async function updateStatus(auditId, newStatus) {
        try {
            const response = await fetch("/admin/update_status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "Id": auditId, "value": newStatus })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }

            const data = await response.json();
             // Show success message

            if(response.ok){
                  successMsg.style.display='block';
                  successMsg.innerText=data['message'];
            }
             else{
                  successMsg.style.display='none';
            };

            setTimeout(()=>{
                successMsg.style.display='none';
            },1000);

        } catch (error) {
            console.error("Error  while updating status:", error);
        }

    }



     // Function to send payment  update request
    async function paymentUpdate(auditId, paymentStatus) {
        try {
            const response = await fetch("/admin/update_payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "Id": auditId, "value": paymentStatus })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }

            const data = await response.json();

             // Show success message
             if(response.ok){
              successMsg.style.display='block';
              successMsg.innerText=data['message'];
              }
              else{
                 successMsg.style.display='none';
              };
               setTimeout(()=>{
                successMsg.style.display='none';
            },2000);


        } catch (error) {
            console.error("Error while  updating payment status:", error);
        }
    }

    // Toggle Mode on Button Click
    toggleButton.addEventListener("click", function () {

        isUpdateMode = !isUpdateMode; // Toggle mode
        toggleButton.innerText = isUpdateMode ? "Save" : "Edit";
        loadTableData(); // Reload table with correct mode
        if(!isUpdateMode){
            location.reload();
        }
    });

    // Initial Data Load
    loadTableData();

    //function to change the text color of audit status  based on there values..
    function ColorUpdate(){
           const color=document.querySelectorAll('.StatusColor');

           color.forEach((ele)=>{
                 let val=ele.textContent;

                 if(val=='Completed'){
                       ele.style.color='#28a745';
                 }
                 else if( val=='In Progress'){
                        ele.style.color="#F97316";
                 }
                 else{
                        ele.style.color="#B91C1C";
                 }
           })

    }
    setTimeout(() => {
         ColorUpdate();
    }, 2000);

    //function for changing payments status color
     function PaymentColor(){
           const payColor=document.querySelectorAll('.paymentColor');
           payColor.forEach((ele)=>{
                 let val=ele.innerText;

                 if(val=='Paid'){
                       ele.style.color='#28a745';

                 }
                 else if( val=='Pending'){
                        ele.style.color="#F97316";
                 }
                 else{
                        ele.style.color="#B91C1C";
                 }
           })

    }
                setTimeout(() => {
                    PaymentColor();

                }, 2000);


            function hover() {
                const elements = document.querySelectorAll('.StatusColor'); // Get all elements
                const element1=document.querySelectorAll('.paymentColor');
                elements.forEach((ele) => {
                    var col='';
                    ele.addEventListener('mouseover', () => {
                        const value = ele.innerText.trim(); // Get text inside td
                        const color=ele.style.color;


                        ele.style.transition = "background-color 0.5s ease-in" ; // Apply transition

                        if (value === 'Completed') {
                            ele.style.backgroundColor = '#28a745';
                            ele.style.borderRadius='15px';

                            ele.style.color='black';
                            col='#28a745';


                        } else if (value === 'In Progress') {
                            ele.style.backgroundColor = '#F97316';
                             ele.style.borderRadius='15px';

                              ele.style.color='black';
                              col='#F97316';


                        } else {
                            ele.style.backgroundColor = '#B91C1C';
                            ele.style.borderRadius='15px';

                             ele.style.color='black';
                             col='#B91C1C';


                        }

                    });

                    ele.addEventListener('mouseout', () => {

                        ele.style.backgroundColor = '';
                        ele.style.borderRadius='';// Reset to default
                         ele.style.opacity='';
                         ele.style.color=col;// Reset to default
                    });
                });


                //payment values bg change on hover

                element1.forEach((ele) => {
                    var col='';
                    ele.addEventListener('mouseover', () => {
                        const value = ele.innerText.trim(); // Get text inside td
                        const color=ele.style.color;

                        ele.style.transition = "background-color 0.5s ease-in" ; // Apply transition

                        if (value === 'Paid') {
                            ele.style.backgroundColor = '#28a745';
                            ele.style.borderRadius='15px';

                            ele.style.color='black';
                            col='#28a745';


                        } else if (value === 'Pending') {
                            ele.style.backgroundColor = '#F97316';
                             ele.style.borderRadius='15px';

                              ele.style.color='black';
                              col='#F97316';


                        } else {
                            ele.style.backgroundColor = '#B91C1C';
                            ele.style.borderRadius='15px';

                             ele.style.color='black';
                             col='#B91C1C';


                        }

                    });

                    ele.addEventListener('mouseout', () => {

                        ele.style.backgroundColor = '';
                        ele.style.borderRadius='';// Reset to default
                         ele.style.opacity='';
                         ele.style.color=col;// Reset to default
                    });
                });
            }

            function rowHover() {
                const elements = document.querySelectorAll('.rowData'); // Get all elements

                elements.forEach((ele) => {
                    ele.addEventListener('mouseover', () => {
                        const value = ele.innerText.trim(); // Get text inside td


                        ele.style.transition = "background-color 0.5s ease-in-out,opacity 0.5s ease-in-out ,transform 0.5s ease-in-out"; // Apply transition
                        ele.style.backgroundColor='lightgrey';
                        ele.style.opacity=0.8;
                        ele.style.transform='scale(1.01)';
                    });
                    ele.addEventListener('mouseout', () => {
                        ele.style.backgroundColor = ''; // Reset to default
                         ele.style.opacity='';// Reset to default
                    });
                });
            }
            setTimeout(()=>{
                hover();
                rowHover()
            },2000)



});


   // Filtering data based on admin choice
async function filteredData(){
    let filter=document.getElementById('filter').value;

    const tableBody = document.querySelector(".table_body");
    try{
        const response= await fetch("/admin/filter",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "data": filter })

        });

        if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }

        const data = await response.json();

        tableBody.innerHTML = ""; // Clear existing rows

            data.forEach((item) => {

                let row = document.createElement("tr");
                row.setAttribute('class','rowData');
                 row.style.borderBottomWidth = '1px';
                row.style.borderColor = '#eab308';

                row.innerHTML = `
                    <td class="bg-gray-800 text-white p-2 text-center">${item.Audit_id}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.auditor_id}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.auditor_name}</td>
                    <td class="bg-gray-800 text-white p-2 text-center ">${item.audit_type}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.planned_date}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.contact}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.email}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.client_id}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.state}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.location}</td>
                    <td class="bg-gray-800 text-white p-2 text-center">${item.payment_amount}</td>
                    <td class="paymentColor" >${item.payment_status}</td>
                    <td class="StatusColor"  >${item.Audit_status}</td>
                `;
                tableBody.appendChild(row);
            })

    } catch (error) {
        console.error("Error:", error);
    }


    //audit status text  color update
    function ColorUpdate(){
           const color=document.querySelectorAll('.StatusColor');
           color.forEach((ele)=>{
                 let val=ele.textContent;
                 console.log(val)
                 if(val=='Completed'){
                       ele.style.color='#28a745';
                 }
                 else if( val=='In Progress'){
                        ele.style.color="#F97316";
                 }
                 else{
                        ele.style.color="#B91C1C";
                 }
           })

    }
    //function for changing payments status color
     function PaymentColor(){
           const payColor=document.querySelectorAll('.paymentColor');
           payColor.forEach((ele)=>{
                 let val=ele.innerText;

                 if(val=='Paid'){
                       ele.style.color='#28a745';
                       console.log('color added')
                 }
                 else if( val=='Pending'){
                        ele.style.color="#F97316";
                 }
                 else{
                        ele.style.color="#B91C1C";
                 }
           })

    }

            function hover() {
                const elements = document.querySelectorAll('.StatusColor'); // Get all elements
                const payEle= document.querySelectorAll('.paymentColor');
                elements.forEach((ele) => {
                    var col='';
                    ele.addEventListener('mouseover', () => {
                        const value = ele.innerText.trim(); // Get text inside td
                        const color=ele.style.color;

                        ele.style.transition = "background-color 0.5s ease-in" ; // Apply transition

                        if (value === 'Completed') {
                            ele.style.backgroundColor = '#28a745';
                            ele.style.borderRadius='15px';

                            ele.style.color='black';
                            col='#28a745';


                        } else if (value === 'In Progress') {
                            ele.style.backgroundColor = '#F97316';
                             ele.style.borderRadius='15px';

                              ele.style.color='black';
                              col='#F97316';


                        } else {
                            ele.style.backgroundColor = '#B91C1C';
                            ele.style.borderRadius='15px';

                             ele.style.color='black';
                             col='#B91C1C';


                        }

                    });

                    ele.addEventListener('mouseout', () => {

                        ele.style.backgroundColor = '';
                        ele.style.borderRadius='';// Reset to default
                         ele.style.opacity='';
                         ele.style.color=col;// Reset to default
                    });
                });

                payEle.forEach((ele) => {
                    var col='';
                    ele.addEventListener('mouseover', () => {
                        const value = ele.innerText.trim(); // Get text inside td
                        const color=ele.style.color;

                        ele.style.transition = "background-color 0.5s ease-in" ; // Apply transition

                        if (value === 'Paid') {
                            ele.style.backgroundColor = '#28a745';
                            ele.style.borderRadius='15px';

                            ele.style.color='black';
                            col='#28a745';


                        } else if (value === 'Pending') {
                            ele.style.backgroundColor = '#F97316';
                             ele.style.borderRadius='15px';

                              ele.style.color='black';
                              col='#F97316';


                        } else {
                            ele.style.backgroundColor = '#B91C1C';
                            ele.style.borderRadius='15px';
                             ele.style.color='black';
                             col='#B91C1C';
                        }
                    });

                    ele.addEventListener('mouseout', () => {

                        ele.style.backgroundColor = '';
                        ele.style.borderRadius='';// Reset to default
                         ele.style.opacity='';
                         ele.style.color=col;// Reset to default
                    });
                });
            }

            function rowHover() {
                const elements = document.querySelectorAll('.rowData'); // Get all elements

                elements.forEach((ele) => {
                    ele.addEventListener('mouseover', () => {
                        const value = ele.innerText.trim(); // Get text inside td


                        ele.style.transition = "background-color 0.5s ease-in-out,opacity 0.5s ease-in-out ,transform 0.5s ease-in-out"; // Apply transition
                        ele.style.backgroundColor = 'grey';
                        ele.style.opacity=0.8;
                        ele.style.transform='scale(1.01)';
                    });
                    ele.addEventListener('mouseout', () => {
                        ele.style.backgroundColor = ''; // Reset to default
                         ele.style.opacity='';// Reset to default
                    });
                });
            }


   setTimeout(() => {
     PaymentColor();
     ColorUpdate();
     hover();
     rowHover()
   }, 1000);

}
document.getElementById("filterBtn").addEventListener("click", filteredData);



// file upload script
document.getElementById('uploadButton').addEventListener('click', function(event) {
            event.preventDefault();  // Prevent default form submission behavior

            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];

            if (!file) {
                alert("Please select an Excel file first!");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet,{
                raw: false,  // Keeps the data as strings, but dates need conversion
                dateNF: "dd-mm-yyyy" // Ensures proper date format
                });

                 if (jsonData.length === 0) {
                        console.warn("File was read, but it returned an empty array.");
                }

                // ✅ Sending JSON data to Flask backend
                fetch('/upload-excel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },  // 👈 Ensure correct JSON content type
                    body: JSON.stringify({ "data": jsonData })  // 👈 Convert object to JSON
                })
                .then(response => response.json())  // Handle response properly
                .then(data => {

                    alert(data.message);
                })
                .catch(error => console.error('Error:', error));
            };

            reader.readAsArrayBuffer(file);
});



//sending request for downloading report
document.getElementById('download').addEventListener('click',async()=>{
         try {
            const value=document.getElementById('fileName').value.trim();
            console.log(value)
            const response = await fetch('/admin/download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({"fileName":value})
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const blob = await response.blob(); // Convert response to Blob (Excel file)
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${value}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            console.log("File downloaded successfully!");
            alert('download success');

         }catch (error) {
                console.error("Download error:", error);
         }
 })






