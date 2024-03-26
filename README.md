# MMM-MoonPhase

This is a module for the [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror/).

Displays the realtime moonphase and increments the shadow daily.

![Demo Image](https://github.com/NolanKingdon/MMM-MoonPhase/blob/master/images/2023-09-15-example-moons.png)

## Using the module

To install this module, navigate into `~/MagicMirror/modules` and type the following commands:

```sh
git clone https://github.com/NolanKingdon/MMM-MoonPhase
```

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
let config = {
	modules: [
		{
			module: "MMM-MoonPhase",
			position: "top_center",
			config: {
				updateInterval: 43200000,
				hemisphere: "N",
				resolution: "detailed",
				basicColor: "white",
				title: true,
				phase: true,
                		size: 200,
				moonAlign: "center",
                		textAlign: "center",
				alpha: 0.7,
                		riseAndSet: {
		                    display: false,
		                    lon: -80.0,
		                    lat: 40.0,
		                    gmtOffset: -3.0
		                }
			}
		},
	]
}
```

## Configuration options

### Standard Options

| Option           | Description                                                       | Default              | Possible
|----------------- |-------------------------------------------------------------------|----------------------|-----------
| `updateInterval` | *Optional* Miliseconds between updates                            | `43200000` (12 hours)| any number
| `hemisphere`     | *Optional* Your location on the earth                             | `"N"` (North)        | `"N"`/`"S"`
| `resolution`     | *Optional* Use detailed moon image or basic circle                | `"detailed"`         | `"detailed"`/`"basic"`
| `basicColor`     | *Optional* Color of moon if using basic resolution                | `"white"`            | any valid css color
| `title`          | *Optional* Toggle module title                                    | `true`               | `true`/`false`
| `phase`          | *Optional* Toggle phase label                                     | `true`               | `true`/`false`
| `age`            | *Optional* Number of days for the current cycle                   | `false`              | `true`/`false`
| `phaseAge`       | *Optional* Number of days for the current phase                   | `false`              | `true`/`false`
| `phaseAgeTotal`  | *Optional* if `phaseAge` is enabled, displays total days in phase | `false`              | `true`/`false`
| `size`           | *Optional* Size (pixels) of moon.                                 | `200`                | any number
| `alpha`          | *Optional* Visibility of dark side of moon                        | `0.8` (Transparent)  | `>=0` to `<= 1`
| `moonAlign`      | *Optional* Flexbox `align-self` for moon canvas                   | `center`             | `start`/`center`/`end`
| `textAlign`      | *Optional* Flexbox `align-self` for text labels                   | `center`             | `start`/`center`/`end`
| `riseAndSet`     | *Optional* Config group for moon rise and set times               | See below            | See below

### Moon Rise/Set Options
Moon rise and set time options are contained within a sub-section of the config (See 'Using the module' example).

Unlike the above config options these configs are not all optional should you enable the display of the moon rise/set times - hence their separation into a separate config object.

If you only provide some of the configs within the `riseAndSet` object when this feature is enabled via the `display` option, the time calculation will be off by large amounts of time.

| Option      | Description                                                                                                                                                             |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `display`   | *Optional* Whether or not to run the calculation for the moon rise and set times. Runs at the same interval specified by `updateInterval` in the normal config options. |
| `lon`       | *Required if `display` is `true`* Your longitude. Used as part of the calculation                                                                                       |
| `lat`       | *Required if `display` is `true`* Your lattitude. Used as part of the calculation                                                                                       |
| `gmtOffset` | *Required if `display` is `true`* The amount of hours **as a decimal** your timezone is behind GMT. For example to represent EST (No DST) you would enter -4.0.         |

### Aditional Configuration

`MoonPhase.css` is set up to enable easy editing of the styles of this module. If you have changes you want but the above config options, feel free to edit the css file on your local. The following id's will likely be what you need:

 - `#moonrise-container` - The `div` that contains the moonrise information
 - `#moonphase-canvas` - The moon image
 - `#moonphase-phase`     
 - `#moonphase-age`

### Compliments Integration

This module will emit the `COMPLIMENT_CONTEXT` notification for integration with [MMM-compliments](https://github.com/NolanKingdon/MMM-compliments).

Possible values are:

 - `new`
 - `wax_cresc`
 - `first`
 - `wax_gib`
 - `full`
 - `wan_gib`
 - `third`
 - `wan_cresc`

See the compliments module for more information on how to configure moonphase specific compliments

