# High Holy Day Seating

ShulNET sells High Holy Day seats the way an airline sells seats: an admin uploads a floor plan of the sanctuary and places seats on it, then seats are assigned and invoiced by staff or chosen by members in the member portal.

## Concepts

| Term | What it is |
|------|------------|
| **Seating chart** | A floor plan image with seats placed on it. Reused every year. |
| **Section** | A color-coded group of seats on a chart, such as Main Floor or Balcony. |
| **Seat** | A labelled spot on the chart (for example `A12`) with a member price and a non-member price. A seat can be marked accessible, or taken out of service. |
| **Season** | One year's High Holy Days (for example "High Holy Days 5787"), sold against one chart. A purchase covers every service in the season. |
| **Assignment** | A seat held by a member for a season: either a **reservation** (sold, usually invoiced) or a **renewal** offer (held for last year's holder). |

## Setting up a chart

1. Go to **High Holy Day Seating → Seating Charts → New Chart** (`/admin/seating-charts`).
2. Upload a floor plan image (PNG, JPG, WebP or GIF, up to 10 MB). Scans or exports of an architect's plan work well. PDFs need to be converted to an image first. You can also start on a blank grid and add the image later.
3. Place seats in the editor:
   - **Add Row**: click where a row starts and where it ends. The number of seats set under "Per row" is spaced evenly between the two points and labelled `A1`, `A2`, … The row letter then moves on to `B`.
   - **Add Seat**: click to place single seats.
   - **Select**: click, shift-click or drag a box to select seats. Drag them to move, use the arrow keys to nudge (hold Shift for bigger steps), and press Delete to remove them.
4. With seats selected, set their section, member and non-member prices, accessible flag and availability. For several seats you can also **Align** them on one line, **Space evenly**, or **Relabel** them as a row (numbered left to right).
5. Click **Save Layout**.

Seat positions are stored as percentages of the image, so the map scales to any screen. Replacing the image with one of the same proportions keeps the seats in place.

A seat that has ever been assigned cannot be deleted, because that would break past seasons' records. Uncheck **Available for sale** to take it out of service instead.

## Creating a season

Go to **High Holy Day Seating → New Season** (`/admin/seating-seasons`) and set:

| Field | Purpose |
|-------|---------|
| Seating chart | The chart to sell. It can't be changed once seats are assigned. |
| First service | Used as the invoice due date (falls back to 30 days out if it has passed). |
| Let members choose seats | Turns on the member portal for this season. |
| Renewal deadline | Last year's holders keep their seats until this moment. |
| General sale opens / closes | The window in which members can choose new seats. |
| Max seats per member | Optional limit for member self-service (staff can exceed it). |
| Revenue GL account | Applied to every seat line item, so seat revenue flows into GL batch exports. |

## Assigning and invoicing seats (staff)

Open a season to see its map. Seats are colored by section when available, and in other colors when selected, held for renewal, reserved but unpaid, or reserved and paid.

1. Click available seats to select them.
2. Search for the member, choose member or non-member pricing, and leave **Create an invoice** checked.
3. Click **Assign & Invoice**. One invoice is created with a line item per seat (for example "High Holy Days 5787 - Seat A12 (Main Floor)"), linked to the season and visible in the member's invoices.

Click a taken seat, or a row in the **Seat Holders** table, to see who holds it and the invoice status, record an occupant name, or release the seat. Releasing a seat removes its line from the invoice, and an invoice left with no lines is cancelled. A seat whose invoice already has payments can't be released until the invoice is adjusted or refunded.

## Member self-service

Members find **High Holy Day Seats** in the member portal (`/member/seating`). A season is listed when member sales are enabled and either the general sale window or the renewal window is open.

Members tap seats on the map and see their price. Members with `member_type = member` see member prices; contacts and prospects see non-member prices. They then choose:

- **Pay now by card**: the seats are reserved and the member goes straight to the usual invoice payment page (Stripe, Authorize.Net or PayPal, whichever is configured).
- **Add to my account and pay later**: the seats are reserved and an open invoice is added to the member's account.

Members see which seats are taken, never who holds them.

## Renewals

To give last year's seat holders first claim on their seats:

1. Edit the new season and set a **Renewal deadline**. Set **General sale opens** after it if renewals should come before everyone else.
2. Click **Offer Renewals** and choose last year's season (it must use the same chart). Every reserved seat from that season is held for the same member at this year's prices, and occupant names carry over. Seats already assigned in the new season are skipped.
3. Until the deadline, members see a notice that their seats are being held, with those seats preselected. Confirming them creates the reservation and invoice. Staff can also confirm a renewal from the season page (**Confirm Renewal & Invoice**) or withdraw it.
4. After the deadline, unclaimed renewal seats become available to anyone.

Holders can confirm renewals during the renewal window even before the general sale opens. They can't pick additional seats until it does.

Without a renewal deadline, renewal offers don't hold seats.

## Double-booking protection

Each seat can have only one assignment per season, enforced by a unique database index on `(seating_season_id, seat_id)`. Reservations run in a transaction, so if two people check out the same seat at the same moment, one succeeds and the other is asked to choose again. No invoice is left behind for the failed attempt.

## Data model

| Table | Notes |
|-------|-------|
| `seating_charts` | Name, description, image path and pixel dimensions |
| `seating_sections` | Name, color and order, per chart |
| `seats` | Label (unique per chart), `x`/`y` as percentages, member and non-member price, accessible, active |
| `seating_seasons` | Chart, sale window, renewal deadline, seat limit, GL account |
| `seat_assignments` | Season, seat, member, status (`reserved` or `renewal`), pricing used, price, occupant name, invoice and invoice item |

Invoices for seats use the existing `invoices` table with `invoiceable` pointing at the `SeatingSeason`. Booking rules live in `App\Services\SeatingService` (`reserve`, `release`, `offerRenewals`).

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/admin/seating-charts` | List and create charts |
| GET | `/admin/seating-charts/{chart}/edit` | Seat map editor |
| PUT | `/admin/seating-charts/{chart}` | Rename or replace the image |
| PUT | `/admin/seating-charts/{chart}/layout` | Save sections and seats |
| GET/POST | `/admin/seating-seasons` | List and create seasons |
| GET/PUT/DELETE | `/admin/seating-seasons/{season}` | Season map, edit, delete |
| POST | `/admin/seating-seasons/{season}/assignments` | Assign (and invoice) seats |
| PATCH/DELETE | `/admin/seating-seasons/{season}/assignments/{assignment}` | Set occupant name, release a seat |
| POST | `/admin/seating-seasons/{season}/renewals` | Copy renewal offers from another season |
| GET | `/member/seating` | Member's open seasons and seats |
| GET | `/member/seating/{season}` | Member seat map |
| POST | `/member/seating/{season}/reserve` | Reserve seats (pay now or invoice) |

## Demo data

`php artisan db:seed` (or `php artisan db:seed --class=SeatingSeeder` on its own) creates:

- A **Main Sanctuary** chart drawn from `database/seeders/assets/demo-sanctuary.svg`. It has 160 seats in rows A–K (no I), with 8 seats on each side of the center aisle, and three sections: Front (rows A–C, $450 member / $650 non-member), Main Floor (D–H, $360 / $540) and Rear (J–K, $250 / $400). The aisle ends of row K are accessible, and seat G16 is out of service.
- **Last year's season**, named from the Hebrew calendar (for example "High Holy Days 5787"). It is filled front to back by family groups. Most invoices are paid; two are open and one is partly paid.
- **The upcoming season**, mid-sale. Renewals were offered from last year. Many have been confirmed (some paid), some families declined, and the rest are still held until a deadline three weeks out. A few newcomers, including non-members at non-member prices, bought rear seats. The general sale is open.

The member portal demo account (`david.cohen@test.com` / `password`) has three seats held for renewal, so the renewal banner and confirm flow can be tried right away. The seeder skips itself if the demo chart already exists. Run `php artisan storage:link` so the floor plan image is served.

## Testing

```bash
php artisan test tests/Feature/SeatingTest.php
```
