# Example: an architecture diagram that had to be redrawn

A three minute presentation video of a student team's flood alert project: a
sensor sends water levels, a small server stores them, and a phone app warns
residents.

## The first version

The first diagram, drawn from the team's slide deck, showed a load balancer, a
message queue, a cluster of three servers and a machine learning model
predicting floods, all appearing at once with a zoom-and-spin transition, while
the narration said "here is how it works".

Reading the repository with the team changed it. There is one server, no queue,
no balancer, and the "model" is a threshold the team set per river. The slide
had been the team's plan for a later year. Shown as the current system, it would
have been a false claim, per `video-core` section 2.

## The diagram as built

```
order       sensor (when the narration says "a sensor on the bridge"), then
            the arrow to the server ("sends the level every five minutes"),
            then the database ("which keeps a week of readings"), then the
            threshold rule ("when the level passes the mark set for that
            river"), then the phone ("residents get a warning")
easing      every element enters on the system's "enter" curve, 400 ms, and
            stays
labels      only the five names the narration says
colours     the team's own blue and amber from their app; text on a solid
            plate
plan        the planned prediction model appears in a separate, final beat,
            labelled "planned for next year", outlined and not filled
```

The composition reads each element's appearance time from the timing sheet. When
the script editor shortened the sentence about the database, the render moved
the database box with it, with no change to the composition.
