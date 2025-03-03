# Import libraries
library(ggplot2)
library(plotly)
library(ggthemes)

# Read in CSV to variable for age filter
dep_age <- read.csv("us_dep_age.csv")
anx_age <- read.csv("us_anx_age.csv")
anx_or_dep_age <- read.csv("us_anx_or_dep_age.csv")

# Read in CSV to variable for race filter
dep_race <- read.csv("dep_race.csv")
anx_race <- read.csv("anx_race.csv")
anx_or_dep_race <- read.csv("anx_or_dep_race.csv")

# Read in CSV to variable for gender/sex filter
dep_gender <- read.csv("dep_gender.csv")
anx_gender <- read.csv("anx_gender.csv")
anx_or_dep_gender <- read.csv("anx_or_dep_gender.csv")

# Read in CSV to variable for education filter
dep_edu <- read.csv("dep_edu.csv")
anx_edu <- read.csv("anx_edu.csv")
anx_or_dep_edu <- read.csv("anx_or_dep_edu.csv")

# Read in CSV to variable for state filter
dep_state <- read.csv("dep_state.csv")
anx_state <- read.csv("anx_state.csv")
anx_or_dep_state <- read.csv("anx_or_dep_state.csv")


# General function created to plot the anxiety/depression rates by different filters in U.S.
general_fun <- function(indicator, filter, dataset, input) {
  
  # Converts character date into numeric date
  dataset$date1 <- as.character(dataset$period_end)
  dataset$date2 <- as.Date(dataset$date1, "%m/%d/%y")
  
  # Graphs the lines on a plot for a specified data set
  graph <- ggplot(dataset[dataset$group %in% input,], aes(date2, value))+
    geom_line(aes(colour = group))+
    labs(title = paste(indicator, "over Time"),
         x = "Date",
         y = "Percentage",
         color = filter)+
    theme_economist()
  ggplotly(graph)
  
}

# Function calls for age filter
general_fun("Depression Symptoms", "Age", dep_age, c("18 - 29 years", "30 - 39 years", "40 - 49 years", "50 - 59 years", "60 - 69 years", "70 - 79 years", "80 years and above"))
general_fun("Anxiety Symptoms", "Age", anx_age, c("18 - 29 years", "30 - 39 years", "40 - 49 years", "50 - 59 years", "60 - 69 years", "70 - 79 years", "80 years and above"))
general_fun("Anxiety or Depression Symptoms", "Age", anx_or_dep_age, c("18 - 29 years", "30 - 39 years", "40 - 49 years", "50 - 59 years", "60 - 69 years", "70 - 79 years", "80 years and above"))

# Function calls for race filter
general_fun("Depression Symptoms", "Race", dep_race, c("Hispanic or Latino", "Non-Hispanic White, single race", "Non-Hispanic Black, single race", "Non-Hispanic Asian, single race"))
general_fun("Anxiety Symptoms", "Race", anx_race, c("Hispanic or Latino", "Non-Hispanic White, single race", "Non-Hispanic Black, single race", "Non-Hispanic Asian, single race"))
general_fun("Anxiety or Depression Symptoms", "Race", anx_or_dep_race, c("Hispanic or Latino", "Non-Hispanic White, single race", "Non-Hispanic Black, single race", "Non-Hispanic Asian, single race"))

# Function calls for gender filter
general_fun("Depression Symptoms", "Gender", dep_gender, c("Male", "Female"))
general_fun("Anxiety Symptoms", "Gender", anx_gender, c("Male", "Female"))
general_fun("Anxiety or Depression Symptoms", "Gender", anx_or_dep_gender, c("Male", "Female"))

# Function calls for education filter
general_fun("Depression Symptoms", "Education", dep_edu, c("Bachelor's degree or higher"))
general_fun("Anxiety Symptoms", "Education", anx_edu, c("High school diploma or GED", "Bachelor's degree or higher"))
general_fun("Anxiety or Depression Symptoms", "Education", anx_or_dep_edu, c("High school diploma or GED", "Bachelor's degree or higher"))

# Function calls for state filter
general_fun("Depression Symptoms", "State", dep_state, c("Hawaii", "Alaska"))
general_fun("Anxiety Symptoms", "State", anx_state, c("Hawaii", "Alaska"))
general_fun("Anxiety or Depression Symptoms", "State", anx_or_dep_state, c("Hawaii", "Alaska"))


