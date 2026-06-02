export const dataGridClassNames = 
" border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";

export const dataGridSxStyles = (isDarkMode: boolean) => {
    return {
        color: isDarkMode ? "#e5e7eb" : "",
        border: isDarkMode ? "1px solid #2d3135" : "1px solid #e5e7eb",
        "& .MuiDataGrid-main": {
            backgroundColor: isDarkMode ? "#1d1f21" : "white",
        },
        "& .MuiDataGrid-footerContainer": {
            backgroundColor: isDarkMode ? "#1d1f21" : "white",
            borderColor: isDarkMode ? "#2d3135" : "#e5e7eb",
        },
        "& .MuiDataGrid-columnHeaders": {
            color: `${isDarkMode ? '#e5e7eb' : ''}`,
            '& [role="row"] > *': {
                backgroundColor: `${isDarkMode ? '#1d1f21' : 'white'}`,
                borderColor: `${isDarkMode ? '#2d3135' : ''}`,
            },
        },
        "& .MuiDataGrid-columnHeader:hover": {
            backgroundColor: isDarkMode ? "#3b3d40" : "",
        },
        // Hide the sort/menu icons by default to give text more space
        "& .MuiDataGrid-iconButtonContainer": {
            visibility: "hidden",
            width: 0,
        },
        // Show them on hover, and allow them to pop out if space is tight
        "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-iconButtonContainer": {
            visibility: "visible",
            width: "auto",
        },
        // Allow the column header text and popup to overflow
        "& .MuiDataGrid-columnHeaderTitleContainer": {
            overflow: "visible !important",
        },
        "& .MuiDataGrid-columnHeader": {
            overflow: "visible !important",
        },
        "& .MuiIconButton-root": {
            color: `${isDarkMode ? '#a3a3a3' : ''}`,
        },
        "& .MuiButton-root": {
            color: `${isDarkMode ? '#e5e7eb' : ''}`,
        },
        "& .MuiTablePagination-root": {
            color: `${isDarkMode ? '#a3a3a3' : ''}`,
        },
        "& .MuiTablePagination-selectIcon": {
            color: `${isDarkMode ? '#a3a3a3' : ''}`,
        },
        "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${isDarkMode ? '#2d3135' : '#e5e7eb'}`,
        },
        "& .MuiDataGrid-row": {
            backgroundColor: isDarkMode ? "#1d1f21" : "white",
            "&:hover": {
                backgroundColor: isDarkMode ? "#3b3d40" : "rgba(243, 244, 246, 1)",
            },
        },
        "& .MuiDataGrid-withBorderColor": {
            borderColor: `${isDarkMode ? '#2d3135' : '#e5e7eb'}`,
        },
    };
};