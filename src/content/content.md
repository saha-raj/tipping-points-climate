# Tipping Points in Climate

[segment]
An interactive visualization to explore how small shifts in key variables can trigger large changes in Earth's climate. 

This simple model with just *three* interacting components demonstrates the principal mechanism behind extreme climatic shifts - the balance between amplifying and stabilizing mechanisms in the climate system.

The modern climate exists in a moderate intermediate state, maintained in large part by the stabilizing role of the climate-biosphere system.

## Snowball and Hothouse Earths
[segment]
More than once in Earth's history, the planet was likely completely covered in ice. These are the so-called *Snowball Earth* events that happened during the late Proterozoic and early Cambrian periods, between 700 and 600 million years ago.
[segment]
There were also extended *Hothouse Earth* periods, characterized by high greenhouse gas concentrations, high temperatures, and little to no ice on the surface.

There are several hypotheses for what caused these events and the research is ongoing. However, regardless of the chain of physical processes that led to these events, they ultimately involved the climate system reaching a *tipping point*.


## A pale blue dot
[segment]
To simplify the enormously complex climate system, let's first zoom far out into space from where the Earth only appears as a *pale blue dot*.
[segment]
From this distance, the Earth is only visible as a few pixels with measureable **brightness** and **color**. We don't see any surface features. But the brightness can tell us how reflective the surface is, and the color can tell us what the average temperature is.

Let us also imagine that we can observe the Earth over very long time periods, spanning millions of years.


## Building the model
[segment]
Now we can start building a very simple model of the Earth's climate.

Being the most basic model, it will only have these mechanisms:
- **Incoming energy** from the sun
- **Outgoing Energy** radiated back to space
- **Ice** formation and melting
- **Greenhouse gas** concentration

The presence of ice and greehouse gases will influence the amount of incoming and outgoing energy, respectively.

[segment]
We'll also assume that the Earth is a perfect sphere with radius $R$, that ice forms uniformly over the surface, and that the greenhouse gas concentration is independent of temperature.

[segment]
Now let's look at each of these mechanisms one by one, starting with incoming energy.

## Incoming Energy
[segment]
The total amount of energy that the Earth receives from the sun can be measured by the amount of energy that is intercepted by the Earth's cross-sectional area, *i.e.* the area of Earth's shadow.
[segment]
Solar energy at Earth's distance is about 1360 Watts per square meter ($S_0$). So the total intercepted energy equals $S_0$ multiplied by Earth's cross-sectional area, $\pi R^2$, so that
$$E_{in} = S_0\pi R^2$$
[segment]
But not all of this intercepted energy actually reaches the surface. Some part of it is reflected back to space by the ice and clouds. Let's only consider the reflectivity of ice. If $\alpha$ is the average reflectivity of ice (albedo), then the total incoming energy can be written as:
$$E_{in} = S_0\pi R^2 (1-\alpha)$$
This is a very crude approximation, but it will still allow us to demonstrate the principles and mechanisms of tipping points.

[segment]
on the relationship between albedo and temperature

## Outgoing Energy
[segment]
Over time, the amount of energy that enters the climate system must equal the amount of energy that leaves the system. This is true even when the climate system is storing some of that energy. 

If the Earth were to behave like a perfect emitter of heat energy (which it is not) and didn't have an atmosphere to trap energy, the outgoing energy can be expressed through the Stefan-Boltzmann law:
$$E_{out} = \sigma T^4 \cdot A $$

where $\sigma$ is the Stefan-Boltzmann constant, $T$ is the temperature, and $A=4\pi R^2$ is the surface area of the Earth. 

[segment]
If there is an atmosphere, some of the outgoing energy would be trapped by the atmosphere. Greenhouse gases like $\mathrm{CO}_2$ and $\mathrm{CH}_4$ are particularly effective at this. In reality, the relationship between greenhouse gas concentration and outgoing energy is complex, but we can again make crude simplifications like assuming an inverse relationship between greenhouse gas concentration and outgoing energy. This way, we can write:
$$E_{out} = \frac{1}{g}4\pi R^2 \sigma T^4$$
where $g$ is a positive value measure of the concentration of greenhouse gases.

## Putting it all together
[segment]
Now that we have two expressions for the rates of incoming and outgoing energies, we can put them together to get the net balance of energy in the system and how it changes over time. In other words, an imbalance between incoming and outgoing energies 
$$E_{in} - E_{out}$$
will cause the heat content of the system to change with time. We can then solve this system to find how the temperature will change over time, as well as other variables like ice that are related to temperature.

[segment]
Written as an ordinary differential equation we have:
$$\frac{dE}{dt}=E_{in} - E_{out} =S_0\pi R^2 (1-\alpha(T))-\frac{1}{g}4\pi R^2 \sigma T^4$$

We can relate the temperature change to the energy change by dividing by the heat capacity of the system, $c$
$$c\frac{dT}{dt}=S_0\pi R^2 (1-\alpha(T))-\frac{1}{g}4\pi R^2 \sigma T^4$$

This single ordinary differential equation (ODE) describes the climate model. This is the *simplest* possible model of the climate system. 

## Climate States
[segment]
We can now solve the model to find how the temperature will change over time, as well as other variables like ice that are related to temperature.

Depending on the initial Temperature and the greenhouse gas concentration, the model will settle into one of two stable states - a *hothouse* state or a *snowball* state.

[segment]
The stability of these two climate states are related to the relative strenghts of the amplifying and stabilizing mechanisms in the climate system, viz. the ice-albedo feedback and the greenhouse gas feedbacks. We call this the 'climate potential'.

In our model, the shape of the potential is determined only by the greenhouse gas concentration, $g$. 

[segment]
For some values of $g$, the potential has two stable states - one at low temperatures and one at high temperatures. This means that depending on the initial conditions, the climate will settle into one or the other state.

[segment]
For other values of $g$, the potential has only one stable state - a single valley. This means that regardless of the initial conditions, the climate will settle into that single stable state.


## Simulation
[segment]
We can now simulate the model and examine what its stable states are by varying the initial temperature and greenhouse gas concentration, using these sliders.

[segment]
&nbsp;

## The Modern Climate
[segment]
The modern climate, starting with the *Holocene* epoch, and going further back to the start of the *Pleistocene* epoch, has been in an intermediate state - *quasi-stable* state that we don't really see in our very crude climate model. In fact, our climate state is nestled somewhere in the region of instability that we see in this model. 

The complex biossphere-climate system has carved out a zone of stability in a larger region of instability. Even here, the climate has oscillated between glacial and interglacial periods all through the Pleistocene epoch. 

## References
[segment]
[1] Ref 1

[2] Ref 2

