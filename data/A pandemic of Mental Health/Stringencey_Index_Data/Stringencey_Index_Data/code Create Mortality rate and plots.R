# graphing ecess death per age group
# this code creates 
library(ggplot2)
library(lubridate)
library(ggthemes)
Weekly_Counts_of_Deaths_by_Jurisdiction_and_Age <- read.csv("Weekly_Counts_of_Deaths_by_Jurisdiction_and_Age.csv")


deaths <- Weekly_Counts_of_Deaths_by_Jurisdiction_and_Age[,c(1,2,6,7,8)]


deaths$`Week Ending Date` <- mdy(deaths$`Week Ending Date`)

us_deaths <- subset( deaths , Jurisdiction == 'United States'  )


#c('25-44 years', '45-64 years', '65-74 years', '75-84 years', '85 years and older')

 x <- us_deaths[,c(4)]/100

 us_deaths <- subset( deaths , Jurisdiction == 'United States'  )

 deaths25_44 <- NULL
 deaths45_64 <- NULL
 deaths65_74 <- NULL
 deaths75_84 <- NULL
 deaths8 <- NULL
 

 
 
 
 
 
deaths25_44 <- subset(us_deaths, `Age Group` == '25-44 years' )
deaths45_64 <- subset(us_deaths, `Age Group` == '45-64 years' )
deaths65_74 <- subset(us_deaths, `Age Group` == '65-74 years' )
deaths75_84 <- subset(us_deaths, `Age Group` == '75-84 years' )
deaths85 <- subset(us_deaths, `Age Group` == '85 years and older' )


rate25 <- deaths25_44[,c(4)]/88220000
rate45 <- deaths45_64[,c(4)]/82760000
rate65 <- deaths65_74[,c(4)]/32540000  
rate75 <- deaths75_84[,c(4)]/16270000
rate85 <- deaths85[,c(4)]/6650000


magnatoi <-  deaths85[,c(6)] / deaths25_44[,c(6)]
mag <-  deaths75_84[,c(6)] / deaths25_44[,c(6)]
fgh <- max(magnatoi)

plot(magnatoi) 

mad <- mean(mag)

tdais <- mean(magnatoi)

deaths25_44 <-  cbind.data.frame(deaths25_44,rate25)
deaths45_64 <-  cbind.data.frame(deaths45_64,rate45)
deaths65_74 <-  cbind.data.frame(deaths65_74,rate65)
deaths75_84 <-  cbind.data.frame(deaths75_84,rate75)
deaths85 <-  cbind.data.frame(deaths85,rate85)

names(deaths25_44)[6] <- "death rate" 
names(deaths45_64)[6] <- "death rate"
names(deaths65_74)[6] <- "death rate"
names(deaths75_84)[6] <- "death rate"
names(deaths85)[6] <- "death rate"

rates <- rbind.data.frame(deaths25_44,deaths45_64,deaths65_74,deaths75_84,deaths85)

rates <- NULL 

rates 




death_fun <- function(age_group=c('25-44 years'),dataset= rates){
  d <- ggplot(dataset[dataset$`Age Group` %in% age_group,], aes(`Week Ending Date`, `death rate`))+
    geom_line(aes(colour = `Age Group`))+
    labs(title = "Mortality Rate in the United States",
         x = "Week ending Dates",
         y = "Death Rate(per Ten Thousand)",
         color= "Age Group")+
    theme_economist()+
   scale_x_date(limits = as.Date(c('2019-01-01','2022-07-01')))
  # geom_errorbar(aes(ymin=value - sd(value), ymax= value+ sd(value)), width=.1,
  #               position=position_dodge(0.05))
  ggplotly(d)
}


death_fun(c('25-44 years', '45-64 years', '65-74 years', '75-84 years', '85 years and older'))












