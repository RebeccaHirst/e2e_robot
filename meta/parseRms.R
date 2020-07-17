library(jsonlite)

# Read and parse JSON
json <- suppressWarnings(readLines("Results/results.json"))
json <- jsonlite::parse_json(json)

# platformSessions maps platform to sessionId
capabilities <- json$capabilities
platforms <- c()
sessionIds <- c()
for (i in 1 : length(capabilities)) {
  capability <- capabilities[[i]]
  platforms <- c(platforms, paste(
    capability$platformName,
    capability$platformVersion,
    capability$browserName,
    capability$browserVersion,
    sep = "-"
  ))
  sessionIds <- c(sessionIds, capability$sessionId)
}
platformSessions <- data.frame(
  platform = platforms,
  sessionId = sessionIds
)

# rmsSessions maps rms to sessionId
suites <- json$suites
rmsValues <- c()
sessionIds <- c()
for (i in 1 : length(suites)) {
  suite <- suites[[i]]
  if (suite$name == "test3") {
    for (j in 1 : length(suite$tests)) {
      if (suite$tests[[j]]$name == "has graphics match refence") {
        test <- suite$tests[[j]]
        sessionIds <- c(sessionIds, suite$sessionId)
        rmsValues <- c(rmsValues, 
          as.numeric(substring(test$error, nchar("Failed: ") + 1))
        )
      }
    }
  }
}
rmsSessions <- data.frame(
  rms = rmsValues,
  sessionId = sessionIds
)

joined <- merge(platformSessions, rmsSessions, by = "sessionId")

