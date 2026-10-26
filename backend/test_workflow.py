from datetime import date

from workflows.search_workflow import search_workflow


result = search_workflow.invoke({
    "search_type": "day",
    "search_value": date(2026, 9, 23)
})


print("\nSEARCH WORKFLOW RESULT:")
print(result)