Please rebuild and clean up the Outfit Records and Create Outfit logic in this Figma prototype.

Important: keep the current visual style, but make the product logic clearer and less messy.

Core data logic:

There are three different content types. Do not mix them.

1. Closet Item
   A single clothing item uploaded by the user.
   Examples:
   White shirt, blue jeans, green hoodie, black boots, handbag.

Closet items belong only to the Closet and Create Outfit item list.

2. Outfit Record
   A saved combination of multiple closet items.
   Examples:
   Green jacket + white shirt + cargo pants + white sneakers + black handbag.

Outfit records belong to Outfit Records Grid and Calendar.

3. Avatar / Body Type
   The mannequin or pixel avatar used to preview the outfit.
   This is not a closet item and should not be shown as a clothing item.

Please separate these clearly in the interface and interactions.

Overall page logic:

* Closet page = single clothing item library
* Create Outfit page = drag closet items onto canvas and compose an outfit
* Outfit Records Grid page = all saved outfit records
* Outfit Records Calendar page = outfits grouped by date

Do not place outfit records inside the Closet page.
Do not place single closet items directly inside the Outfit Records Grid unless they are displayed as small thumbnails inside an outfit card.

Page 1: Outfit Records — Grid

Keep the current Grid / Calendar switch at the top.

Grid page should show all saved Outfit Records.

If there are no saved outfits, show the current empty state:

* “No outfits yet”
* “Tap + to create your first look”

The floating plus button opens Create Outfit.

When outfits exist, show outfit cards.

Each outfit card should include:

* One large composed outfit preview image
* One small pixel avatar preview wearing the outfit
* Date, for example “14 May 2026”
* Style tag, for example “Casual”
* Item count, for example “5 items”
* A row of clothing item thumbnails

Do not use fixed clothing slots.

The item thumbnail row should adapt to the number of items:

* If the outfit has 1–4 items, show all item thumbnails
* If the outfit has more than 4 items, show the first 4 thumbnails and a “+N” badge
* Example: top, bottom, shoes, bag, +1

This allows different outfit structures:

* Basic outfit: top + bottom + shoes
* Layered outfit: top + bottom + shoes + outerwear
* Full outfit: top + bottom + shoes + outerwear + bag + accessories

Outfit cards should be clean and compact, not too crowded.

Page 2: Outfit Records — Calendar

Calendar page should show which dates have saved outfits.

Very important:
Do not only use a small purple dot to indicate saved outfits.
Instead, show a tiny pixel avatar outfit thumbnail near the date number.

For every date that has a saved outfit:

* Show the date number normally
* Add a mini pixel avatar thumbnail under or next to the date number
* The mini avatar should be small but recognizable
* It should roughly show the outfit style or color of that day
* This makes the calendar more visual and playful

If a date has multiple outfits:

* Show the first outfit’s pixel avatar thumbnail
* Add a small “+1” or “+2” badge near it
* Do not use only a dot

The selected date should still use the purple selected background.

For example:
If 14 May has one saved outfit:

* The calendar cell for 14 May should show “14”
* Under the number, show a tiny pixel avatar wearing that outfit

If 20 May has three saved outfits:

* The calendar cell for 20 May should show “20”
* Under the number, show a tiny pixel avatar
* Add a small “+2” badge

The lower section should show:
“Outfits for 14 May”
“1 / 3”

Below that, show outfit cards saved for the selected date.

Each date can support up to 3 outfits per day.

If the selected date has no outfit:

* Show “0 / 3”
* Show an Add outfit button

If users tap Add outfit from the Calendar page:

* Open Create Outfit
* Pre-fill the date selector with the selected calendar date

Example:
If users select 20 May and tap Add outfit, the Create Outfit page should open with “20 May 2026” already selected.

Page 3: Create Outfit

Keep the current structure:

* Top navigation with Cancel and Create Outfit title
* Left canvas
* Right closet item list
* Bottom navigation bar

The right item list should only contain Closet Items, not outfit records.

Each item card in the right item list should show:

* Clothing thumbnail
* Clothing name
* Color
* Category

Example:
White Shirt / White / Top
Green Hoodie / Green / Top
Black Boots / Black / Shoes

Users can drag closet items from the right list onto the canvas.

Canvas behavior:

* Users can drag and arrange items freely
* Users can resize items using +/- or corner handles
* Users can layer items, for example shirt under jacket
* Users can tap an item to select it
* Selected item shows a thin purple outline
* A small delete icon appears near selected item
* Users can remove selected item

Add a fixed save bar above the bottom navigation bar.

The save bar should include:

1. Date selector on the left
2. Style category selector in the middle or above the save button
3. Save Outfit button on the right

Date selector:
Default date should be Today.

Show as a rounded pill:
Calendar icon + “Today, 14 May”

When users tap the date selector, open a bottom sheet:
Title: “Choose outfit date”
Options:

* Today
* Yesterday
* Pick another date
* Cancel

If users tap Pick another date, show a simple mini calendar picker.

Style category:
Add a simple style selector:
Casual, Minimal, Cute, Sport, Formal

Default style is Casual.

Save Outfit button:

* Disabled when canvas is empty
* Active when at least one clothing item is on the canvas

Disabled state:
Light lavender background, muted purple text

Active state:
Deep purple background, white text

When users tap Save Outfit:

* Save the current canvas as a new Outfit Record
* Save the selected date
* Save the selected style category
* Save the selected closet item thumbnails
* Generate or attach a pixel avatar preview of the outfit
* Show success toast:
  “Outfit saved to 14 May”
* Navigate back to Outfit Records Grid

Saved outfit should automatically appear in:

* Grid page as a new outfit card
* Calendar page on the selected date with a mini pixel avatar thumbnail

Important interaction flow:

Grid plus button → Create Outfit
Calendar Add outfit button → Create Outfit with selected date
Create Outfit Save Outfit → back to Grid
Grid card tap → open outfit detail preview
Calendar date tap → show outfits saved on that date

Clean-up requirements:

Please simplify the current messy logic.

Use clear names for components:

* ClosetItemCard
* OutfitRecordCard
* OutfitCalendarCell
* CreateOutfitCanvas
* OutfitSaveBar
* PixelAvatarPreview

Do not reuse the same card component for closet items and outfit records.

ClosetItemCard is for single clothing items only.
OutfitRecordCard is for saved outfit combinations only.

Calendar cells should not show random dots.
Calendar cells with outfits must show mini pixel avatar thumbnails.

The prototype does not need real backend functionality, but the interaction should visually simulate saving and showing the saved outfit in Grid and Calendar.

Use Figma interactive components and variants where possible.

Suggested variants:

OutfitRecordsPage:

* Grid Empty
* Grid With Records
* Calendar Empty Date
* Calendar Date With Outfit

CreateOutfitPage:

* Empty Canvas
* Canvas With Items
* Date Picker Open
* Save Success

CalendarCell:

* Default
* Selected
* Has Outfit
* Selected Has Outfit
* Has Multiple Outfits

Visual style:

* Keep the deep purple primary color
* Keep light lavender backgrounds
* Keep rounded cards
* Keep elegant serif page headings
* Keep clean mobile app layout
* Keep the current bottom navigation
* Avoid adding too many new colors
* Keep the screen clean and app-like

Most important goal:

Make the product logic easy to understand:
Closet stores clothing items.
Create Outfit combines clothing items.
Grid stores saved outfit records.
Calendar shows saved outfit records by date, with mini pixel avatars directly inside the date cells.
