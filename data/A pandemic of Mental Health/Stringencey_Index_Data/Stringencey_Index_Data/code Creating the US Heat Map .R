#United States heat Maps 

install.packages("countrycode")
install.packages("plotly")
library(countrycode)
library(plotly)

Pandemic_Metrics <- read.csv("Pandemic_Metrics.csv")



g <- list(
  scope = 'usa',
  projection = list(type = 'albers usa'),
  lakecolor = toRGB('white')
)



plot_geo() %>%
  add_trace(
    z = ~Pandemic_Metrics$`Mean of the Stringency Index` , text = state.name, span = I(0),
    locations = state.abb, locationmode = 'USA-states'
  ) %>%
  layout(geo = g)

plot_geo() %>%
  add_trace(
    z = ~Pandemic_Metrics$`Anxiety or Depression Diffrenence` , text = state.name, span = I(0),
    locations = state.abb, locationmode = 'USA-states'
  ) %>%
  layout(geo = g)

plot_geo() %>%
  add_trace(
    z = ~Pandemic_Metrics$`GDP Growth Rate` , text = state.name, span = I(0),
    locations = state.abb, locationmode = 'USA-states'
  ) %>%
  layout(geo = g)

plot_geo() %>%
  add_trace(
    z = ~Pandemic_Metrics$`Mortality Rate` , text = state.name, span = I(0),
    locations = state.abb, locationmode = 'USA-states'
  ) %>%
  layout(geo = g)
