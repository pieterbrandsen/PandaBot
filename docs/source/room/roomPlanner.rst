########################################################################
Room planner
########################################################################

To setup a room and build the base this feature will be used.

A room has different features that need to be build and checked:
- Defense
- Source structures
- Base
- Roads

The following features will be included:
- Road builder
- Source structures
- Controller structure
- Defense
- Base

********************
Function list
********************

.. csv-table::
  :header: Name, Description
  :widths: 30 70
  
  a, b

************************
How is it going to work?
************************
Road builder
================

A road must be able to be build in the same room or to a external room.

A optimal path must be gathered using the road fatigue of a road.

Source/controller structures 
============================

Check at target if a structure needs to build/upgraded. If this is the case a check for optimal placement will be done to do the action.

Defense
================

Optimal wall/ramfeature building to close the base from outsiders. When using a bunker the optimal placement differs from all other bases.

This is optimized based on the least amount of ramfeatures and closest to the base.

Base
================

Get optimal base type first using swamp/plain terrain.

Use the optimal base type and plan that type out when possible. 
