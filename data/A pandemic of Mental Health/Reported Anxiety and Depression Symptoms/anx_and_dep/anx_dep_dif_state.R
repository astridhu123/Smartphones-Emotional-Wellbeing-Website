# Read in CSV to variable for state filter
dep_state <- read.csv("dep_state.csv")
anx_state <- read.csv("anx_state.csv")
anx_or_dep_state <- read.csv("anx_or_dep_state.csv")

# Converts dates for R to understand
date_convert <- function(dataset){
  # Converts character date into numeric date
  dataset$date1 <- as.character(dataset$period_end)
  dataset$date2 <- as.Date(dataset$date1, "%m/%d/%y")
  return(dataset)
}

dep_state2 <- date_convert(dep_state)
anx_state2 <- date_convert(anx_state)
anx_or_dep_state2 <- date_convert(anx_or_dep_state)


# "Treatment Period" -- 2021-07-05
# When using these dates, you have to change the data set you use and the dates

#Dates Before 
dep_stringBefore <- subset(dep_state2, date2>= "2020-05-05" & date2 <"2021-07-05")
anx_stringBefore <- subset(anx_state2, date2>= "2020-05-05" & date2 <"2021-07-05")
anx_or_dep_stringBefore <- subset(anx_or_dep_state2, date2>= "2020-05-05" & date2 <"2021-07-05")


#Dates After
dep_stringAfter <- subset(dep_state2, date2 >= "2021-07-05")
anx_stringAfter <- subset(anx_state2, date2 >= "2021-07-05")
anx_or_dep_stringAfter <- subset(anx_or_dep_state2, date2 >= "2021-07-05")


# this function allows you to calculate the mean by picking the states and the dataset 

mean_fun <- function(stateinput,dataset){
  state_mean <- with(dataset, mean(value[group == stateinput],na.rm = TRUE))
  return(state_mean)
}

# Initializes the variables
states <- NULL
totalMean <- NULL
beforeMean <- NULL
afterMean <- NULL


# For loop that assigns values to above variables
# For loop for depression data
for (k in 1:length(dep_state2$group)){
  totalMean <- c(totalMean,mean_fun(dep_state2$group[k],dep_state2))
  beforeMean <- c(beforeMean,mean_fun(dep_state2$group[k],dep_stringBefore))
  afterMean <- c(afterMean,mean_fun(dep_state2$group[k],dep_stringAfter))
  states <- c(states,dep_state2$group[k])
}

# Puts variables into data frame
dep_Mean <- cbind.data.frame(states,totalMean,beforeMean,afterMean)

# Calculates the difference for each state
dep_Dif <- dep_Mean$afterMean-dep_Mean$beforeMean

# Adds the difference to the data frame created in part in line 60
dep_Mean <- cbind.data.frame(states,totalMean,beforeMean,afterMean,dep_Dif)

# Deletes repeating state rows - only 51 states
new_dep_Mean <- dep_Mean[-c(52:2346),]

# Writes the data frame to CSV file
write.csv(new_dep_Mean, file = "dep_mean.csv")

# Reinitializes the variables
states <- NULL
totalMean <- NULL
beforeMean <- NULL
afterMean <- NULL

# For loop for anxiety data
for (k in 1:length(anx_state2$group)){
  totalMean <- c(totalMean,mean_fun(anx_state2$group[k],anx_state2))
  beforeMean <- c(beforeMean,mean_fun(anx_state2$group[k],anx_stringBefore))
  afterMean <- c(afterMean,mean_fun(anx_state2$group[k],anx_stringAfter))
  states <- c(states,anx_state2$group[k])
}

# Puts variables into data frame
anx_Mean <- cbind.data.frame(states,totalMean,beforeMean,afterMean)

# Calculates the difference for each state
anx_Dif <- anx_Mean$afterMean-anx_Mean$beforeMean

# Adds the difference to the data frame created in line 89
anx_Mean <- cbind.data.frame(states,totalMean,beforeMean,afterMean,anx_Dif)

# Deletes repeating state rows - only 51 states
new_anx_Mean <- anx_Mean[-c(52:2346),]

# Writes the data frame to CSV file
write.csv(new_anx_Mean, file = "anx_mean.csv")


# For loop for anxiety or depression data
for (k in 1:length(anx_or_dep_state2$group)){
  totalMean <- c(totalMean,mean_fun(anx_or_dep_state2$group[k],anx_or_dep_state2))
  beforeMean <- c(beforeMean,mean_fun(anx_or_dep_state2$group[k],anx_or_dep_stringBefore))
  afterMean <- c(afterMean,mean_fun(anx_or_dep_state2$group[k],anx_or_dep_stringAfter))
  states <- c(states,anx_or_dep_state2$group[k])
}

# Puts variables into data frame
anx_or_dep_Mean <- cbind.data.frame(states,totalMean,beforeMean,afterMean)

# Calculates the difference for each state
anx_or_dep_Dif <- anx_or_dep_Mean$afterMean-anx_or_dep_Mean$beforeMean

# Adds the difference to the data frame created in line 113
anx_or_dep_Mean <- cbind.data.frame(states,totalMean,beforeMean,afterMean,anx_or_dep_Dif)

# Deletes repeating state rows - only 51 states
new_anx_or_dep_Mean <- anx_or_dep_Mean[-c(52:2346),]

# Writes the data frame to CSV file
write.csv(new_anx_or_dep_Mean, file = "anx_or_dep_mean.csv")
