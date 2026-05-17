Please add a new “Outfit Collections” feature to the existing prototype.

Purpose:
Users should be able to group saved outfits into collections for future planning, such as trips, weekly planning, events, or style themes.

This feature supports pre-planned outfits, not only past outfit records.

Current Outfits page has:

* Grid
* Calendar

Please update it to have three tabs:

* Grid
* Calendar
* Collections

Tab meaning:

Grid:
Shows all saved OutfitRecords.

Calendar:
Shows saved or planned outfits by date, using pixel avatars inside date cells.

Collections:
Shows user-created outfit collections for planning.

Important data logic:

ClosetItem:
Single clothing item with an ID such as C001, C002, C003.

OutfitRecord:
One saved outfit, with:

* outfitID
* customizable outfit name
* date
* style category
* linked Closet item IDs
* full outfit mannequin image
* pixel avatar image

OutfitCollection:
A group of saved OutfitRecords, with:

* collectionID
* collection name
* purpose / occasion
* optional date range
* list of linked OutfitRecord IDs
* cover image

Do not mix these data types.

Closet stores single clothing items.
Grid stores saved OutfitRecords.
Calendar displays OutfitRecords by date.
Collections groups multiple OutfitRecords for future planning.

Add Collections tab:

In the Outfits page, add a third tab next to Grid and Calendar:

Grid | Calendar | Collections

Use the same visual style:

* deep purple selected tab
* light lavender inactive tab
* rounded pill shape

Collections page layout:

If there are no collections, show an empty state:
“No collections yet”
“Plan outfits for trips, events, or the week ahead”
Add button:
“Create Collection”

If collections exist, show collection cards.

Each collection card should include:

* collection cover image
* collection name
* purpose / occasion tag
* number of outfits
* optional date range
* small row of pixel avatar thumbnails from outfits inside the collection

Example collection cards:

1. “Melbourne Trip”
   Tag: Travel
   Date range: 2 May – 6 May
   5 outfits

2. “Work Week”
   Tag: Weekly Plan
   Date range: 12 May – 16 May
   5 outfits

3. “Formal Events”
   Tag: Formal
   3 outfits

Collection card visual design:

* rounded white card
* soft shadow or subtle border
* cover image on top or left
* pixel avatars shown as small thumbnails
* deep purple text for title
* lavender metadata labels

Create Collection flow:

Add a floating plus button on the Collections page.

When tapped, open a “Create Collection” page or modal.

Create Collection should include:

* Collection name field
* Purpose / occasion selector
* Optional date range selector
* Outfit selection area

Collection name default:
“Untitled Collection”

Purpose selector options:

* Travel
* Work Week
* Formal
* Casual
* Seasonal
* Custom

Date range:
Optional.
Users can choose start date and end date.

Outfit selection:
Show existing saved OutfitRecords from Grid.
Each selectable outfit row/card should show:

* full outfit mannequin thumbnail
* pixel avatar thumbnail
* outfit name
* date
* style tag

Users can select multiple outfits.
Selected outfits show a purple checkmark.

Bottom button:
“Save Collection”

When Save Collection is tapped:

* Create one OutfitCollection
* Link the selected OutfitRecord IDs
* Return to Collections tab
* Show toast: “Collection saved”

Collection Detail page:

When users tap a collection card, open Collection Detail.

Collection Detail should show:

* collection name
* purpose / occasion tag
* date range if available
* number of outfits
* Edit button
* list/grid of outfits inside the collection

Each outfit inside the collection should show:

* full outfit mannequin image
* pixel avatar preview
* outfit name
* date
* style tag
* linked Closet item count

Tapping an outfit inside Collection Detail opens the same Outfit Detail page used by Grid and Calendar.

Edit Collection:

Users can edit a collection.

Edit Collection should allow:

* rename collection
* change purpose / occasion
* change date range
* add outfits
* remove outfits from the collection
* delete collection

Important:
Removing an outfit from a collection should only remove it from that collection.
It must not delete the OutfitRecord from Grid or Calendar.

Delete Collection:
Add a red text button:
“Delete Collection”

Confirmation modal:
Title:
“Delete this collection?”

Message:
“This will only delete the collection. The outfits inside it will stay in Grid and Calendar.”

Buttons:

* Cancel
* Delete

If user confirms Delete:

* Remove the collection
* Keep all OutfitRecords
* Return to Collections tab
* Show toast: “Collection deleted”

Calendar relationship:

Collections can be used for planning.

If a Collection has a date range and outfits with assigned dates:

* Calendar should still show those outfits on their individual dates using pixel avatars.

If an outfit is added to a Collection but has no date:

* It appears only in the Collection, not Calendar.

If the user assigns a date to an outfit inside a Collection:

* It should appear on the Calendar date cell with its pixel avatar.

Add to Collection action:

On Outfit Detail page, add an option:
“Add to Collection”

When tapped:

* Show a modal with existing collections
* User can choose one or more collections
* Also allow “Create New Collection”
* After adding, show toast: “Added to collection”

Grid card action:

In the Grid outfit card three-dot menu, add:

* Edit Outfit
* Add to Collection
* Delete Outfit

Prototype demonstration:

This prototype does not need real backend logic.
Use interactive components and variants to simulate:

* creating a collection
* selecting outfits
* saving a collection
* opening collection detail
* adding an outfit to a collection
* deleting a collection

Visual style:
Keep existing app style:

* deep purple primary color
* light lavender backgrounds
* rounded cards
* elegant serif headings
* clean mobile layout
* existing bottom navigation
* soft shadows

Main goal:

Make Collections feel like a planning feature:
Users can save outfits in Grid, view them by date in Calendar, and group them into Collections for trips, weekly outfit planning, events, or future occasions.
