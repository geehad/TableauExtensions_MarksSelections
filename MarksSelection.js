'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function() {
    // Use the jQuery document ready signal to know when everything has been initialized
    $(document).ready(function() {
        // Tell Tableau we'd like to initialize our extension
        tableau.extensions.initializeAsync().then(function() {
            // Once the extension is initialized, ask the user to choose a sheet
            showChooseSheetDialog();
			
			initializeButtons()
        });
    });


    
	
    /**
     * Shows the choose sheet UI. Once a sheet is selected, the data table for the sheet is shown
     */
    function showChooseSheetDialog() {
        // Clear out the existing list of sheets
        $('#choose_sheet_buttons').empty();

        // Set the dashboard's name in the title
        const dashboardName = tableau.extensions.dashboardContent.dashboard.name;
        $('#choose_sheet_title').text(dashboardName);

        // The first step in choosing a sheet will be asking Tableau what sheets are available
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

        // Next, we loop through all of these worksheets and add buttons for each one
        worksheets.forEach(function(worksheet) {
            // Declare our new button which contains the sheet name
            const button = $("<button type='button' class='btn btn-default btn-block'></button>");
            button.text(worksheet.name);

            // Create an event handler for when this button is clicked
            button.click(function() {
                // Get the worksheet name which was selected
                const worksheetName = worksheet.name;

                // Close the dialog and show the data table for this worksheet
                $('#choose_sheet_dialog').modal('toggle');
                loadSelectedMarks(worksheetName);
            });

            // Add our button to the list of worksheets to choose from
            $('#choose_sheet_buttons').append(button);
        });

        // Show the dialog
        $('#choose_sheet_dialog').modal('toggle');
    }
	
	
	let unregisterEventHandlerFunction;

    function loadSelectedMarks(worksheetName) {
        
		
		if (unregisterEventHandlerFunction){
			
			unregisterEventHandlerFunction();
		}
		
		
		// get selected sheet object
		
		const selected_sheet = getSelectedSheet(worksheetName);
		
		// set title to name of selected worksheet
		$('#selected_marks_title').text(selected_sheet.name);
		
		// Call to get the selected marks for the worksheet
        selected_sheet.getSelectedMarksAsync().then(function (marks) {
        // Get the first DataTable for our selected marks (usually there is just one)
        const worksheetData = marks.data[0];

        // Map the data into a format that datatable expects
	    
            const data = worksheetData.data.map(function(row, index) {
                const rowData = row.map(function(cell) {
                    return cell.formattedValue;
                });

                return rowData;
            });

            const columns = worksheetData.columns.map(function(column) {
                return {
                    title: column.fieldName
                };
            });

            // Populate the data table with the rows and columns we just pulled out
            populateDataTable(data, columns);	

         });	
        
		
		// Add an event listener for the selection changed event on this sheet.
        unregisterEventHandlerFunction = selected_sheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function(selectionEvent) {
            // When the selection changes, reload the data
            loadSelectedMarks(worksheetName);
        });
    }


    function populateDataTable(data, columns) {
		
	     $('#data_table_wrapper').empty();
		 
		 if (data.length > 0 ){
			 
			 
			$('#no_data_message').css('display', 'none');
            $('#data_table_wrapper').append(`<table id='data_table' class='table table-striped table-bordered'></table>`);
			
			// Initialize our data table with what we just gathered
            $('#data_table').DataTable({
                data: data,
                columns: columns,
                autoWidth: false,
                deferRender: true,
                scroller: true,
                scrollY: $(document).height,
                scrollX: true,
                dom: "<'row'<'col-sm-6'i><'col-sm-6'f>><'row'<'col-sm-12'tr>>" // Do some custom styling
            });
			 
			 
		 } else{
			 
			 
			$('#no_data_message').css('display', 'inline'); 
			 
			 
		    }	
	}
	
	function initializeButtons() {
        $('#show_choose_sheet_button').click(showChooseSheetDialog);
    }
	
	function getSelectedSheet(worksheetName) {
        // Go through all the worksheets in the dashboard and find the one we want
        return tableau.extensions.dashboardContent.dashboard.worksheets.find(function(sheet) {
            return sheet.name === worksheetName;
        });
    }
	
	
	
})();