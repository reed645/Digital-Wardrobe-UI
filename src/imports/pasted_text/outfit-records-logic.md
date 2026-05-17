Please update the Outfit Records prototype with a clean and consistent saved outfit logic.

Important asset upload rule:

For each outfit, I will upload the assets in this order:

1. Individual clothing item images
2. Full outfit mannequin image
3. Pixel avatar image

These assets belong to one saved outfit record.

If multiple outfits are uploaded, treat each group as one outfit set. The full outfit mannequin image and the pixel avatar image must stay linked to the same outfit.

Asset type definitions:

1. Clothing item images
   These are the single clothing pieces used in the outfit, such as shirt, pants, shoes, bag, jacket, accessories.

2. Full outfit mannequin image
   This is the realistic full-body mannequin preview of the complete outfit.
   This image must be the main image in the Grid outfit card and the Outfit Detail page.

3. Pixel avatar image
   This is the playful pixel-style preview of the same outfit.
   This image should be used mainly in the Calendar date cells and as a small secondary preview in Grid or Outfit Detail.

Do not mix these asset types.

Closet item = individual clothing piece.
Outfit record = saved complete outfit.
Full mannequin image = main outfit preview.
Pixel avatar = calendar preview.

Core product logic:

Closet page:
Stores individual clothing items only.

Create Outfit page:
Allows users to combine closet items into a new outfit record.

Grid page:
Shows all saved outfit records.

Calendar page:
Shows saved outfit records grouped by date.

Do not put saved outfit records inside Closet.
Do not show individual clothing items as main Grid cards.
Do not use only pixel avatars in Grid.
Grid must always use the full outfit mannequin image as the main preview.

Page 1: Outfit Records — Grid

Keep the current “Grid / Calendar” switch at the top.

The Grid page should display all saved Outfit Records.

If there are no saved outfits, show the empty state:
“No outfits yet”
“Tap + to create your first look”

The floating plus button opens Create Outfit.

When saved outfits exist, show outfit cards.

Each outfit card must include:

* Full outfit mannequin image as the large main preview
* Pixel avatar image as a small secondary preview
* Outfit name
* Date
* Style category
* Item count
* A row of individual clothing item thumbnails
* Edit button or three-dot menu

The full outfit mannequin image should be the most visually important element on the card.

The pixel avatar should be smaller, for example in the corner of the card, beside the title, or as a small badge.

The clothing thumbnail row should adapt to the number of clothing items:

* If the outfit has 1–4 items, show all thumbnails
* If the outfit has more than 4 items, show the first 4 thumbnails and a “+N” badge

Do not use a fixed number of clothing slots.

Example Grid card layout:

Top:
Large full outfit mannequin image

Below:
Outfit name
Date
Style tag
“5 items”

Bottom:
Small row of clothing thumbnails
Small pixel avatar preview
Edit / more button

Page 2: Outfit Records — Calendar

The Calendar page should show which dates have saved outfits.

Very important:
Do not use only small dots to indicate saved outfits.

For every date that has a saved outfit:

* Show the date number normally
* Add the corresponding pixel avatar image directly near, beside, or under the date number
* The pixel avatar should be small but recognizable
* The user should be able to roughly see the outfit style from the calendar view

The Calendar should use only the pixel avatar image, not the full mannequin image.

If a date has one outfit:

* Show one mini pixel avatar inside that date cell

If a date has multiple outfits:

* Show the first outfit’s pixel avatar
* Add a small “+1” or “+2” badge next to it

Do not replace the pixel avatar with a purple dot.

Calendar interaction:

When the user taps either:

* the date number, or
* the pixel avatar inside the date cell,

the lower section should automatically show that date’s outfit information.

The lower section should show:
“Outfits for 14 May”
“1 / 3”

Below this, show outfit cards for that selected date.

Calendar and Grid must be linked:

* The same saved outfit appears in Grid and Calendar
* Grid shows all outfits
* Calendar groups outfits by selected date
* The pixel avatar shown on the Calendar date must match the same outfit card in Grid
* Tapping a calendar outfit opens the same Outfit Detail page as tapping the outfit card in Grid

Each date can support up to 3 outfits.

If the selected date has no outfit:

* Show “0 / 3”
* Show an Add outfit button

If users tap Add outfit from the Calendar page:

* Open Create Outfit
* Pre-fill the date selector with the selected calendar date

Page 3: Create Outfit

Keep the current Create Outfit layout:

* Top navigation with Cancel and Create Outfit title
* Left canvas area
* Right clothing item list
* Bottom navigation bar

The right item list should contain only individual clothing items.

Users drag clothing items from the right list onto the canvas.

Canvas behavior:

* Users can drag items onto the canvas
* Users can resize items
* Users can layer items
* Users can tap an item to select it
* Selected item shows a thin purple outline
* A small delete icon appears near the selected item
* Users can remove selected items

Add a fixed save bar above the bottom navigation.

The save bar should include:

* Date selector
* Style category selector
* Save Outfit button

Date selector:
Default date is Today.

Show as a rounded pill:
Calendar icon + “Today, 14 May”

When tapped, open a bottom sheet:
Title: “Choose outfit date”
Options:

* Today
* Yesterday
* Pick another date
* Cancel

If users tap Pick another date, show a simple mini calendar picker.

Style category selector:
Options:

* Casual
* Minimal
* Cute
* Sport
* Formal

Default style is Casual.

Save Outfit button:

* Disabled when the canvas is empty
* Active when at least one clothing item is placed on the canvas

Disabled state:
Light lavender background, muted purple text

Active state:
Deep purple background, white text

When users tap Save Outfit:
Create one Outfit Record containing:

* Outfit name, default “Untitled Outfit”
* Selected date
* Selected style category
* Full outfit mannequin image
* Pixel avatar image
* Individual clothing item thumbnails
* Item count

After saving:

* Add the outfit to Grid
* Add the pixel avatar to the corresponding Calendar date
* Return to Grid
* Show toast: “Outfit saved”

Page 4: Outfit Detail

When users tap:

* an outfit card in Grid, or
* a saved outfit in Calendar,

open the Outfit Detail page.

Outfit Detail should show:

* Large full outfit mannequin image at the top
* Pixel avatar preview as a smaller secondary image
* Outfit name
* Date
* Style category
* Item count
* Individual clothing item thumbnails
* Edit button

The full outfit mannequin image should be the main focus.

The pixel avatar should be shown as a small companion preview, not as the main image.

Page 5: Edit Outfit

Each saved outfit must support editing.

Users can open Edit Outfit from:

* the three-dot menu on the Grid card
* the Edit button on the Outfit Detail page

Edit Outfit should allow users to:

* Rename the outfit
* Change the date
* Change the style category
* Add clothing items
* Remove clothing items
* Replace or update the full outfit mannequin image
* Replace or update the pixel avatar image

Add a Save Changes button.

After saving changes:

* Update the outfit card in Grid
* Update the pixel avatar on the correct Calendar date
* If the date changes, remove it from the old date and add it to the new date
* Show toast: “Outfit updated”

Delete function:

Delete can be placed inside the Edit Outfit page.

At the bottom of Edit Outfit, add a red text button:
“Delete Outfit”

When tapped, show a confirmation modal:

Title:
“Delete this outfit?”

Message:
“This will remove it from Grid and Calendar.”

Buttons:

* Cancel
* Delete

If the user confirms Delete:

* Remove the outfit from Grid
* Remove the pixel avatar from Calendar
* Return to Grid
* Show toast: “Outfit deleted”

Important design rules:

Use separate components:

* ClosetItemCard
  For individual clothing items only.

* OutfitRecordCard
  For saved outfit records in Grid.

* OutfitCalendarCell
  For calendar dates.

* PixelAvatarPreview
  For the pixel avatar image.

* FullOutfitPreview
  For the realistic mannequin image.

Do not reuse ClosetItemCard as OutfitRecordCard.

Do not use pixel avatar as the main Grid preview.

Do not use full mannequin image inside Calendar date cells.

Calendar date cells should use pixel avatars only.

Grid cards should use full outfit mannequin images as main images.

Visual style:

Keep the existing design:

* Deep purple primary color
* Light lavender background
* Rounded cards
* Elegant serif headings
* Clean mobile app layout
* Existing bottom navigation
* Soft shadows
* Minimal, polished interface

Prototype flow summary:

Grid plus button → Create Outfit
Calendar Add Outfit → Create Outfit with selected date
Create Outfit Save Outfit → Grid
Grid outfit card tap → Outfit Detail
Calendar date or pixel avatar tap → show outfits for that date
Calendar outfit tap → Outfit Detail
Outfit Detail Edit → Edit Outfit
Edit Outfit Save Changes → update Grid and Calendar
Edit Outfit Delete Outfit → remove from Grid and Calendar

Main goal:

Make the saved outfit system clear and consistent.

Grid is the visual outfit record library using full mannequin outfit images.
Calendar is the date-based outfit record view using pixel avatar thumbnails.
Create Outfit creates one saved outfit record.
Edit Outfit manages name, date, style, images, items, and delete.
