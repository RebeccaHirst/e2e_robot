library(jsonlite)

# Read and parse JSON
json <- suppressWarnings(readLines("../.tmp/json_logs/results.json"))
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

# results maps rms to sessionId
suites <- json$suites
sessionIds <- c()
suiteNames <- c()
specNames <- c()
states <- c()
errors <- c()
for (i in 1 : length(suites)) {
  suite <- suites[[i]]
  for (j in 1 : length(suite$tests)) {
    test <- suite$tests[[j]]
    sessionIds <- c(sessionIds, suite$sessionId)
    suiteNames <- c(suiteNames, suite$name)
    specNames <- c(specNames, test$name)
    states <- c(states, test$state)
    if (test$state != "passed") {
      errors = c(errors, test$error)
    } else {
      errors = c(errors, "")
    }
  }
}
results <- data.frame(
  sessionId = sessionIds,
  suite = suiteNames,
  spec = specNames,
  state = states,
  error = errors
)

joined <- merge(platformSessions, results, by = "sessionId")

write.table(joined, file = "results.csv", sep = "\t", row.names = FALSE)

