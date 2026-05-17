Please update the existing prototype with a clean and consistent wardrobe-outfit data logic.

Important correction:

Closet clothing items should use simple IDs, not names, as the source of truth.

Saved outfits should still have customizable names.

So the logic is:

Closet item:

* Uses fixed clothing item ID, for example C001, C002, C003
* The ID is used to link this clothing item to outfits
* Clothing item names are optional and not required

Saved outfit:

* Uses internal outfit ID, for example O001, O002, O003
* Has a customizable outfit name
* The outfit name can be edited by the user later

Data model:

ClosetItem:

* itemID, for example C001
* image
* optional category
* optional color

OutfitRecord:

* outfitID, for example O001
* outfitName, user editable, default “Untitled Outfit”
* date
* styleCategory
* linkedClosetItemIDs
* fullOutfitMannequinImage
* pixelAvatarImage
* itemCount

Important:
Do not rely on clothing item names to link items and outfits.
Use Closet item IDs as the source of truth.

Example:
O001 uses Closet item IDs:
C002, C003, C004, C008

The outfit name might be:
“2 May Outfit”
or a custom name entered by the user.

Closet page logic:

Closet stores individual clothing items only.

Each clothing item card should show:

* clothing image
* small ID label, for example C001
* optional category label, such as Top, Bottom, Shoes, Bag, Outerwear

The ID label should be visible but small.

Do not put saved outfit records inside the Closet page.

Outfit Records Grid page logic:

Grid shows saved outfit records, not individual closet items.

Each outfit card should show:

* full outfit mannequin image as the large main preview
* pixel avatar image as a small secondary preview
* customizable outfit name
* date
* style category
* item count
* linked Closet item thumbnails
* linked Closet item IDs under thumbnails
* Edit or three-dot menu button

Important:
Grid must use the full outfit mannequin image as the main preview.
Do not use only the pixel avatar in Grid.

The linked clothing thumbnails should come from existing Closet item IDs.

Do not duplicate clothing item images inside Outfit Records.
Outfit Records only reference linked Closet item IDs.

The item thumbnail row should be flexible:

* Show all linked items if there are 1–4
* If more than 4 items, show the first 4 thumbnails and a “+N” badge
* Do not use fixed empty clothing slots

Calendar page logic:

Calendar shows saved outfit records grouped by date.

Calendar date cells should use pixel avatar images only.

For every date that has a saved outfit:

* Show the date number normally
* Show the corresponding pixel avatar image directly near or under the date number
* Do not use only a dot
* The pixel avatar should be small but recognizable

If a date has multiple outfits:

* Show the first outfit’s pixel avatar
* Add a small “+1” or “+2” badge

When the user taps either:

* the date number, or
* the pixel avatar inside the date cell,

show the outfit information for that date in the lower section.

The lower section should show:
“Outfits for [date]”
“1 / 3”

Below this, show compact outfit cards for that date.

Each date can support up to 3 outfits.

If the selected date has no outfit:

* Show “0 / 3”
* Show an Add Outfit button

If users tap Add Outfit from Calendar:

* Open Create Outfit
* Pre-fill the date selector with the selected calendar date

Calendar and Grid must be linked:

* The same OutfitRecord appears in Grid and Calendar
* Grid shows all saved outfits
* Calendar shows outfits grouped by date
* The pixel avatar shown in Calendar must match the same outfit card shown in Grid
* Tapping a Calendar outfit opens the same Outfit Detail page as tapping the Grid card

Create Outfit page logic:

Create Outfit allows users to create a new saved outfit record by selecting existing Closet item IDs.

Right side item list:

* Should show existing Closet items only
* Each item should show image + ID label, for example C001
* Users can drag Closet items onto the canvas

Canvas behavior:

* Users can drag items onto the canvas
* Users can resize items
* Users can layer items
* Users can tap an item to select it
* Selected item shows a thin purple outline
* A small delete icon appears near the selected item
* Removing an item from canvas only removes it from the outfit composition
* It must not delete the Closet item

Add a fixed save bar above the bottom navigation.

Save bar should include:

* Outfit name field
* Date selector
* Style category selector
* Save Outfit button

Outfit name:

* Default value: “Untitled Outfit”
* User can customize it
* This name belongs to the OutfitRecord, not the Closet items

Date selector:

* Default date is Today
* If opened from Calendar, pre-fill selected Calendar date
* Tapping date selector opens a bottom sheet:

  * Today
  * Yesterday
  * Pick another date
  * Cancel

Style category selector:
Options:

* Casual
* Minimal
* Cute
* Sport
* Formal

Default style:
Casual

Save Outfit button:

* Disabled when no Closet item is placed on canvas
* Active when at least one Closet item is placed on canvas

When Save Outfit is tapped:
Create one new OutfitRecord containing:

* new outfitID, for example O001
* outfitName from the editable name field
* selected date
* selected style category
* linked Closet item IDs from the canvas
* full outfit mannequin image
* pixel avatar image
* item count

After saving:

* Add the outfit to Grid
* Add the pixel avatar to the corresponding Calendar date
* Return to Grid
* Show toast: “Outfit saved”

Important:
The full outfit mannequin image and pixel avatar image may be uploaded separately after the Closet item IDs are selected.
Keep them linked to the same OutfitRecord.

Outfit Detail page:

When users tap an outfit card in Grid or Calendar, open Outfit Detail.

Outfit Detail should show:

* large full outfit mannequin image at the top
* small pixel avatar preview
* outfit name
* outfit ID, for example O001, shown subtly
* date
* style category
* item count
* linked Closet item thumbnails
* linked Closet item IDs under thumbnails
* Edit button

The full outfit mannequin image should be the main visual focus.
The pixel avatar should be secondary.

Edit Outfit page:

Users can open Edit Outfit from:

* Edit button on Outfit Detail
* three-dot menu on Grid card

Edit Outfit should allow users to:

* Rename the outfit
* Change date
* Change style category
* Add linked Closet items by selecting Closet item IDs
* Remove linked Closet item IDs
* Replace or update the full outfit mannequin image
* Replace or update the pixel avatar image

Important:
Changing outfit linked items should only update the linked Closet item IDs.
It should not duplicate or delete Closet items.

Add Save Changes button.

After saving changes:

* Update Grid card
* Update Calendar date cell
* If the date changed, remove the pixel avatar from the old date and add it to the new date
* If the outfit name changed, update the name everywhere
* Show toast: “Outfit updated”

Delete function:

Delete should be inside Edit Outfit.

At the bottom of Edit Outfit, add a red text button:
“Delete Outfit”

When tapped, show confirmation modal:

Title:
“Delete this outfit?”

Message:
“This will remove it from Grid and Calendar. Closet items will not be deleted.”

Buttons:

* Cancel
* Delete

If user confirms Delete:

* Remove the OutfitRecord from Grid
* Remove the pixel avatar from Calendar
* Keep all Closet items
* Return to Grid
* Show toast: “Outfit deleted”

Component naming:

Use separate components:

* ClosetItemCard
* OutfitRecordCard
* OutfitCalendarCell
* FullOutfitPreview
* PixelAvatarPreview
* CreateOutfitCanvas
* OutfitSaveBar
* OutfitDetail
* EditOutfit

Do not reuse ClosetItemCard as OutfitRecordCard.
Do not use pixel avatar as the main Grid preview.
Do not use full mannequin image inside Calendar date cells.
Do not duplicate clothing item images in Outfit Records.

Visual style:

Keep the current app style:

* Deep purple primary color
* Light lavender background
* Rounded cards
* Elegant serif headings
* Clean mobile layout
* Existing bottom navigation
* Soft shadows
* Minimal polished interface

Main goal:

Closet stores individual clothing items with IDs.
Create Outfit links existing Closet item IDs into an OutfitRecord.
Grid shows saved outfits using full mannequin images.
Calendar shows saved outfits by date using pixel avatars.
Outfit names are customizable in Create/Edit.
Deleting an outfit does not delete Closet items.
