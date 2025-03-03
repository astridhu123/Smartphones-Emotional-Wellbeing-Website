# plot the diffrent sates within the stringencey Index 
#reads in the librarys
library(ggplot2)
library(ggplotly)
library(ggthemes)

#reads in the csv File
string_ind <- read.csv("string_ind.csv")



# Ploting the string index 
string_fun <- function(stateinput=c('Ohio','Utah','Texas'),dataset= string_ind, values){
  string <- ggplot(dataset[dataset$States %in% stateinput,], aes(Dates, value))+
    geom_line(aes(colour = States))+
    labs(title = "Stringency Index Over Time",
         x = "Time",
         y = "Stringency Index",
         color= "States")+
    theme_economist()
  # +scale_x_date(limits = as.Date(c('2018-06-01','2021-12-01')))
  # +geom_errorbar(aes(ymin=value - sd(value), ymax= value+ sd(value)), width=.1,
  #               position=position_dodge(0.05))
  ggplotly(string)
}


string_fun(c('New Mexico', 'New York', 'South Dakota', 'Utah'))

