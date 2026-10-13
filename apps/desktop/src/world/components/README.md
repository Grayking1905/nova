# Nova world components

One model per file: `Desk`, `Chair`, `Table`, `Sofa`, `Plant`, `Screen`, `Whiteboard`, `CoffeeMachine`, `Bookshelf`, `Podium`, `Lamp`, `Fountain`, `Arcade`, `Noticeboard`, `Clock`, and `Door`. Small props (`Cup`, `Notebook`, `Rug`), architectural layers (`RoomFloor`, `RoomDecor`, `RoomArchitecture`, `Corridor`), avatars, labels, interaction hints, minimap, and the break game also have separate files.

`index.ts` registers draw functions, optional animation overlays, and spring poses. A canonical size lets detailed furniture illustrations scale to each model's footprint. `Scene.ts` caches sprites once, culls objects outside the camera, depth-sorts them with avatars, and paints shared interaction feedback. Labels render last so furniture never hides a person's name. Static floors are cached separately.

To add a component:

1. Add the fixture type and room-relative placement to `../map.ts`. Its footprint drives collision; chairs, doors, clocks, and wall notices remain walkable.
2. Create a file exporting its draw function and optional `animate` / `pose` functions. Reuse `primitives.ts` for materials and `animation.ts` for spring motion and particle effects.
3. Register it in `index.ts`. Animation frames include shared interaction progress, occupancy, lamp state, proximity, and reduced motion.
4. Bind the activity in `../../App.tsx`; shared interactions are validated and broadcast by the room server. Effects run in the existing canvas loop, never in component timers.
5. Run `pnpm test`, `pnpm lint`, and `pnpm build`. Reachability tests check every room, interactive fixture, and all 72 seats.
