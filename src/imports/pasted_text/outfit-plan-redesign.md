Please redesign the current “New Collection” page into an “Outfit Plan” feature.

Current problem:
The current page looks like a collection builder. It has “New Collection”, “Collection Name”, and “Select Outfits”. This does not match the purpose.

Expected feature:
This should be an Outfit Plan feature for planning future outfits by day.

Update naming:

Change the top tab label from “Sets” to:
“Plan”

The Outfits page tabs should be:
Grid | Cal | Plan

Change page title from:
“New Collection”

To:
“New Outfit Plan”

Change field label from:
“Collection Name”

To:
“Plan Name”

Default input:
“Untitled Plan”

Keep the overall purple/lavender visual style.

Core logic:

Outfit Plan is not just a collection of saved outfits.
It is a future planning tool.

Users can plan outfits in two ways:

1. Date Range mode
   User selects a start date and end date.
   The system creates one planning slot for each date in that range.

Example:
From 12 May to 14 May creates:

* 12 May
* 13 May
* 14 May

2. Number of Days mode
   User enters the number of days they want to plan.
   The system creates Day 1, Day 2, Day 3, etc.

Example:
3 days creates:

* Day 1
* Day 2
* Day 3

Add a planning mode selector:

Planning Type:

* Date Range
* Number of Days

Use segmented control or two rounded buttons.

If Date Range is selected:
Show:

* From date picker
* To date picker

If Number of Days is selected:
Show:

* Number of days input
* Stepper controls: minus / plus
* Example value: 3 days

Plan slots section:

Replace “Select Outfits” with:
“Plan Days”

Each plan slot should be a card.

For Date Range mode, each card title should be the actual date:

* 12 May
* 13 May
* 14 May

For Number of Days mode, each card title should be:

* Day 1
* Day 2
* Day 3

Each plan slot can have zero, one, or multiple outfits.

Important:
Do not force every day to already have an outfit.
Empty days are allowed.

If a plan day has no outfit, show an empty state inside the card:
“No outfit planned”
Buttons:

* Choose Saved Outfit
* AI Generate
* Create New Outfit

If a plan day has an outfit, show:

* full outfit mannequin thumbnail
* pixel avatar thumbnail
* outfit name
* style tag
* linked item count

Allow up to 3 outfits per plan day.

Actions for each plan day:

1. Choose Saved Outfit
   Opens a modal or selection sheet showing saved Outfit Records from Grid.
   Each saved outfit row should show:

* full outfit mannequin thumbnail
* pixel avatar thumbnail
* outfit name
* date if available
* style tag

User can select one outfit and assign it to that plan day.

2. AI Generate
   Simulates a recommendation.
   Open or show a generated outfit result using existing saved/demo outfit visuals.
   The generated result should include:

* full outfit mannequin preview
* pixel avatar preview
* outfit pieces
  Buttons:
* Use This Outfit
* Regenerate

When user taps Use This Outfit:
Assign it to that plan day.

This is only a prototype simulation. It does not need real AI generation.

3. Create New Outfit
   Opens the existing Create Outfit page.
   Pre-fill the target plan day or selected date.
   After saving, the new outfit should be assigned to that plan day.

Plan saving:

At the bottom, add a fixed button:
“Save Outfit Plan”

When tapped:
Create one OutfitPlan containing:

* planID
* planName
* planningType: Date Range or Number of Days
* dateRange if used
* numberOfDays if used
* plannedDaySlots
* linked OutfitRecord IDs for each day

After saving:

* Return to the Plan tab
* Show toast: “Outfit plan saved”

Plan tab overview:

The Plan tab should show saved Outfit Plans as cards.

Each Outfit Plan card should include:

* plan name
* planning type
* date range or number of days
* number of planned outfits
* small row of pixel avatar previews from planned days
* progress text, for example:
  “2 / 3 days planned”

Example cards:

“Melbourne Trip”
Travel
12 May – 16 May
4 / 5 days planned

“Work Week”
Work Week
5 days
3 / 5 days planned

“Weekend Looks”
Casual
2 days
1 / 2 days planned

Plan Detail page:

When users tap an Outfit Plan card, open Plan Detail.

Plan Detail should show:

* plan name
* planning type
* date range or number of days
* list of plan day cards

Each plan day card should show:

* date or day label
* planned outfit if available
* empty state if not planned
* buttons to choose saved outfit, AI generate, or create new outfit

Edit Plan:

Users can edit:

* plan name
* planning type
* date range
* number of days
* outfits assigned to each day

Deleting a plan:
Add a red “Delete Outfit Plan” button inside Edit Plan.

Deleting an Outfit Plan should not delete the saved Outfit Records inside it.

Calendar relationship:

If an Outfit Plan uses actual dates, planned outfits should also appear on the Calendar date cells using their pixel avatar images.

If an Outfit Plan uses only Day 1, Day 2, Day 3 without specific dates, it should stay only inside Plan and should not appear on Calendar until dates are assigned.

Important:
Calendar shows date-based outfits.
Plan can support both actual dates and non-date day planning.

Data logic:

ClosetItem:
Single clothing item with ID C001, C002, etc.

OutfitRecord:
Saved outfit with:

* outfitID
* customizable outfit name
* date optional
* style category
* linked Closet item IDs
* full outfit mannequin image
* pixel avatar image

OutfitPlan:
Planning object with:

* planID
* planName
* planningType
* dateRange or numberOfDays
* planDaySlots
* linked OutfitRecord IDs per slot

Do not mix ClosetItem, OutfitRecord, and OutfitPlan.

Visual requirements:

Keep:

* deep purple primary buttons
* light lavender backgrounds
* rounded cards
* elegant serif headings
* bottom navigation unchanged
* clean mobile layout

Make the feature feel like:
“Plan future outfits by day”
not:
“Create a simple outfit collection”
