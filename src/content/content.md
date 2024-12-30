# Tipping Points in Climate

An interactive visualization to explore how small shifts in key variables can bring about large shifts in Earth's climate. 

The model used here is very simple, with only three partially interacting components. Still it demonstrates the core underlying mechanisms behind some extreme climatic shifts in Earth's past – the interplay between amplifying mechanisms, or positive feedbacks, and braking mechanisms in the climate system.

Earth's climate in the modern geological era sits in an intermediate state, held in place by the overall negative feedbacks, or brakes, due to the complex and co-evolved climate-biosphere system. 

## The pale blue dot

The climate is a complex system with innumerable interacting components. At the heart of its dynamic nature is the energy it receives from the Sun, the energy it holds in its land, air, and water masses, and the energy it radiates back to space. 

If we could zoom out to where the Earth was only visible as a 'pale blue dot', and observed for millions, if not hundreds of millions of years, we'd notice big changes in its color and brightness over geologic time. 

More than once, most, if not all, of Earth's surface was covered with ice. There were also long episodes with no permanent polar ice caps. Each such event had their own specific chains of geologic events that led to those extreme climates, but in each case there were amplifying mechanisms, or positive feedbacks, that shifted the delicate balance with the suppressing mechanisms, the negative feedbacks.

We'll start by building a minimal model of Earth's climate, as if we could only view it as a few pixels with color and brightness.

## The simplest model

This simple model will have three basic mechanisms - energy coming into and leaving the system, energy held by the atmosphere and ocean, and the amount of reflective ice on the surface. Temperature,  a measure of the heat energy in the system, is what connects these mechanisms together. 

These are the things we have to account for. so here's the construction

- ice grows in response to temperature

- no latitudinal dependence for ice growth, no ice caps as such, ice grows everywhere evenly

- atmosphere has greenhouse gases. it controls how much energy is retained by the atmosphere. but in this setup, greenhouse gases are not affected by the other moving parts

- the short term differences between incoming and outgoing energy determines how temperature changes with time. 



## Incoming Energy

We can measure how much energy Earth receives from the Sun, on average. At Earth's distance the amount of energy per square meter is about 1360 Watts. Let's call this $S_0$. The total amount of energy intercepted by the Earth is $S_0$ multiplied by Earth's cross-sectional area, $\pi R^2$. 

Let's suppose that some fraction of Earth's surface is covered by ice, and that on average ice reflects back some (high) percent of the the incoming energy immediately back to space. We'll call this fraction of incoming energy that is reflected back the albedo of ice, $\alpha$. 

So the total incoming energy, $E_{in}$, can be expressed as

$$E_{in} = S_0\pi R^2 (1-\alpha)$$

Now the albedo depends on temperature. We can draw the simplest possible dependence by assuming that ice grows uniformly when the global average temperature is below freezing and melts uniformly when it is above freezing. 

## Outgoing Energy

Over geologic timescales, the Earth radiates out the same amount of energy as it receives from the Sun, just in different forms (low entropy incoming energy vs high entropy outgoing energy). Ultimately incoming and outgoing energy has to balance out, otherwise the temperature would keep increasing or decreasing. Despite fluctuations in global climate over geologic timescales, on average Earth's temperature has remained in a steady regime for most of its life.

We can quantify the amount outgoing radiation based on the average surface temperature, using the Stefan-Boltzmann law, which would assume the Earth to be a perfect emitter of radiant energy – a black body. For an Earth without any atmospheric greenhouse gas, the outgoing energy $E_{out}$, would be

$$E_{out} = \sigma T^4 \cdot A $$

where $A=4\pi R^2$ is the surface area of earth, $\sigma$ is the Stefan-Boltzmann's constant, and $T$ is the average global temperature. 

Now if the atmosphere has greenhouse gases, some of the radiation that would be otherwise emitted would now be retained, to decrease the net outward energy flux. We can sketch a very simple (and utterly crude) relationship between greenhouse gas concentration (g) and the amount of energy that escapes - the higher the value of $g$, the lower the value of $E_{out}$, such that
$$E_{out} = \frac{1}{g}4\pi R^2 \sigma T^4, \textrm {where } g > 0$$

## The Simplest Climate Model

With the two pieces of incoming and outgoing energy, we can now write an ordinary differential equation for the rate of change of energy in the system, as

$$\frac{dE}{dt}=E_{in} - E_{out} =S_0\pi R^2 (1-\alpha(T))-\frac{1}{g}4\pi R^2 \sigma T^4$$
Finally, we can express the rate of change of energy as the rate of change of temperature, as

$$c\frac{dT}{dt}=S_0\pi R^2 (1-\alpha(T))-\frac{1}{g}4\pi R^2 $$

And that's it! There's the so-called '1-dimensional climate model' - the simplest possible climate model, with only one dynamical variable - temperature (hence the 1-dimensional) and three processes - radiative energy loss, ice-albedo effect, and the greenhouse effect, all connected through changes in temperature.

## Simulation

## etc
In essence, the Earth receives energy from the Sun and some of this energy is reflected back into space immediately without being absorbed, and some of it is absorbed. Ice is a good reflector of incoming energy, while the oceans and atmospheric greenhouse gases help absorb or retain energy. The greater the amount of heat in the system, the less likely it is for ice to grow and vice versa. 

The presence of ice acts as a positive feedback. More ice cover leads to more energy being radiated out, which lowers the heat content, which lowers the temperature, which makes more ice, continuing the cycle. The same is true in the reverse direction as well with decreasing ice cover leading to its further decrease.

However, the amiplifying trends have their limits. Once ice covers all of the Earth its amplifying effects are held at a max and cannot increase. 




