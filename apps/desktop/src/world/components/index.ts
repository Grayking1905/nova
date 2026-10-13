import type { Fixture, FixtureType } from '../map';
import type { Context } from './primitives';
import type { ComponentFrame, Pose } from './animation';
import { drawPlant, animatePlant, posePlant } from './Plant';
import { drawScreen, animateScreen, poseScreen } from './Screen';
import { drawWhiteboard, animateWhiteboard, poseWhiteboard } from './Whiteboard';
import { drawDesk, animateDesk, poseDesk } from './Desk';
import { drawChair, animateChair, poseChair } from './Chair';
import { drawTable, animateTable, poseTable } from './Table';
import { drawSofa, animateSofa, poseSofa } from './Sofa';
import { drawCoffeeMachine, animateCoffeeMachine, poseCoffeeMachine } from './CoffeeMachine';
import { drawBookshelf, animateBookshelf, poseBookshelf } from './Bookshelf';
import { drawPodium, animatePodium, posePodium } from './Podium';
import { drawLamp, animateLamp } from './Lamp';
import { drawFountain, animateFountain } from './Fountain';
import { drawArcade, animateArcade, poseArcade } from './Arcade';
import { drawNoticeboard, animateNoticeboard } from './Noticeboard';
import { drawClock, animateClock } from './Clock';
import { drawDoor, animateDoor } from './Door';

type Model = {draw:(c:Context,f:Fixture)=>void;animate?:(c:Context,f:Fixture,frame:ComponentFrame)=>void;pose?:(frame:ComponentFrame)=>Pose;size?:[number,number]};
export const componentModels:Record<FixtureType,Model>={
  plant:{draw:drawPlant,animate:animatePlant,pose:posePlant,size:[49, 49]},
  screen:{draw:drawScreen,animate:animateScreen,pose:poseScreen,size:[300, 66]},
  board:{draw:drawWhiteboard,animate:animateWhiteboard,pose:poseWhiteboard,size:[365, 60]},
  desk:{draw:drawDesk,animate:animateDesk,pose:poseDesk,size:[220, 89]},
  chair:{draw:drawChair,animate:animateChair,pose:poseChair},
  table:{draw:drawTable,animate:animateTable,pose:poseTable},
  sofa:{draw:drawSofa,animate:animateSofa,pose:poseSofa},
  coffee:{draw:drawCoffeeMachine,animate:animateCoffeeMachine,pose:poseCoffeeMachine,size:[294, 90]},
  shelf:{draw:drawBookshelf,animate:animateBookshelf,pose:poseBookshelf,size:[140, 54]},
  podium:{draw:drawPodium,animate:animatePodium,pose:posePodium},
  lamp:{draw:drawLamp,animate:animateLamp},
  fountain:{draw:drawFountain,animate:animateFountain},
  arcade:{draw:drawArcade,animate:animateArcade,pose:poseArcade},
  noticeboard:{draw:drawNoticeboard,animate:animateNoticeboard},
  clock:{draw:drawClock,animate:animateClock},
  door:{draw:drawDoor,animate:animateDoor},
};
export function drawFixture(c:Context,f:Fixture) {const model=componentModels[f.type];c.save();if(model.size){c.translate(f.x,f.y);c.scale(f.w/model.size[0],f.h/model.size[1]);model.draw(c,{...f,x:0,y:0,w:model.size[0],h:model.size[1]});}else model.draw(c,f);c.restore();}
