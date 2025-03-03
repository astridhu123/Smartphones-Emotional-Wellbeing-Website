# script for linear Models 

#Use the library used
library(stargzer)
library(ggplot2)
library(reshape2)


#reads in The CSV
Pandemic_Metrics <- read.csv("Pandemic_Metrics.csv")

#this creates the correlation matrix
cor(Pandemic_Metrics[c(2:31)])
cormat <- round(cor(Pandemic_Metrics[c(2:31)]),2)
melted_cormat <- melt(cormat)
melted_cormat1 <- subset(melted_cormat, (value < -.15))
metric_cor <- ggplot(data = melted_cormat, aes(x=Var1, y=Var2, fill=value)) + 
  geom_tile()
ggplotly(metric_cor)



#These are the different models 
m1.1 <-lm(`Anxiety or Depression Diffrenence` ~ `Mean of the Stringency Index` , data=Pandemic_Metrics)
summary(m1.1)

m1.2 <-lm(`Anxiety or Depression Diffrenence` ~ `Mean of the Stringency Index` + `Adults Over 65`  ,data=Pandemic_Metrics)
summary(m1.2)

m1.3 <-lm(`Anxiety or Depression Diffrenence` ~ `Mean of the Stringency Index` + `Adults Over 65` + `GDP Growth Rate` ,data=Pandemic_Metrics)
summary(m1.3)

m1.4 <-lm(`Anxiety or Depression Diffrenence` ~ `Mean of the Stringency Index` + `GDP Growth Rate`,data=Pandemic_Metrics)
summary(m1.4)

m1.5 <-lm(`Anxiety or Depression Diffrenence` ~ `Mean of the Stringency Index` + `Adults Over 65` + `GDP Growth Rate`+ percen_death$`Percent Death` ,data=Pandemic_Metrics)
summary(m1.5)

m1.6 <-lm(`Anxiety or Depression Diffrenence` ~ `Mean of the Stringency Index` + `Adults Over 65`  + `GDP Growth Rate` + beforeMean  ,data=Pandemic_Metrics)
summary(m1.6)

m1.7 <-lm(`Anxiety or Depression Diffrenence` ~ `Mean of the Stringency Index` + `Adults Over 65` + `GDP Growth Rate`+ `Mortality Rate` +  beforeMean  ,data=Pandemic_Metrics)
summary(m1.7)





stargazer(m1.1, m1.2, m1.3, m1.5, m1.7 , type ='text', keep.stat=c("n","adj.rsq"))

stargazer(m1.1, m1.2, m1.3, m1.5, m1.7  , type ='html', keep.stat=c("n","adj.rsq"), out = 'Linear Model2.doc')
