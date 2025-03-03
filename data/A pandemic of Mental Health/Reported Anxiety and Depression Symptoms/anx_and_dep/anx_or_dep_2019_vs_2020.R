# Import libraries
library(ggplot2)
library(plotly)

# Read in CSV and assign to variable
anx_or_dep_comparison <- read.csv("anx_or_dep_2019_vs_2020.csv")

# Modifies the data for R to understand in matrix form
data_base <- reshape(anx_or_dep_comparison,                       
                     idvar = "year",
                     timevar = "month",
                     direction = "wide")
row.names(data_base) <- data_base$year
data_base <- data_base[ , 2:ncol(data_base)]
colnames(data_base) <- c("May", "June", "July", "August", "September", "October", "November", "December")
data_base <- as.matrix(data_base)

# Creates grouped barplot using ggplot2
barplot(height = data_base,                       # Grouped barplot using Base R
        beside = TRUE)


barplot(data_base, main="Anxiety or Depression Symptoms Reported in 2019 vs. 2020",
        xlab="Months", col=c("darkblue","red"),
        legend = rownames(data_base), beside=TRUE,
        cex.names=0.8)
  
