{
    explainVersion: '2',
        queryPlanner: {
    namespace: 'hw3-db.movies',
        indexFilterSet: false,
        parsedQuery: { fullplot: { '$regex': 'killer' } },
    queryHash: 'C8D3C723',
        planCacheKey: '21EF8422',
        maxIndexedOrSolutionsReached: false,
        maxIndexedAndSolutionsReached: false,
        maxScansToExplodeReached: false,
        winningPlan: {
        queryPlan: {
            stage: 'COLLSCAN',
                planNodeId: 1,
                filter: { fullplot: { '$regex': 'killer' } },
            direction: 'forward'
        },
        slotBasedPlan: {
            slots: '$$RESULT=s5 env: { s7 = /killer/, s2 = Nothing (SEARCH_META), s3 = 1697736329405 (NOW), s8 = PcreRegex(/killer/), s1 = TimeZoneDatabase(Antarctica/Casey...America/Cayenne) (timeZoneDB) }',
                stages: '[1] filter {traverseF(s4, lambda(l1.0) { (((l1.0 == s7) ?: false) || (regexMatch(s8, l1.0) ?: false)) }, false)} \n' +
            '[1] scan s5 s6 none none none none lowPriority [s4 = fullplot] @"1236ee16-61bf-43d6-a43c-b360c6e5da75" true false '
        }
    },
    rejectedPlans: []
},
    executionStats: {
        executionSuccess: true,
            nReturned: 523,
            executionTimeMillis: 50,
            totalKeysExamined: 0,
            totalDocsExamined: 23541,
            executionStages: {
            stage: 'filter',
                planNodeId: 1,
                nReturned: 523,
                executionTimeMillisEstimate: 50,
                opens: 1,
                closes: 1,
                saveState: 23,
                restoreState: 23,
                isEOF: 1,
                numTested: 23541,
                filter: 'traverseF(s4, lambda(l1.0) { (((l1.0 == s7) ?: false) || (regexMatch(s8, l1.0) ?: false)) }, false) ',
                inputStage: {
                stage: 'scan',
                    planNodeId: 1,
                    nReturned: 23541,
                    executionTimeMillisEstimate: 46,
                    opens: 1,
                    closes: 1,
                    saveState: 23,
                    restoreState: 23,
                    isEOF: 1,
                    numReads: 23541,
                    recordSlot: 5,
                    recordIdSlot: 6,
                    fields: [ 'fullplot' ],
                    outputSlots: [ Long("4") ]
            }
        }
    },
    command: {
        find: 'movies',
            filter: { fullplot: { '$regex': 'killer' } },
        '$db': 'hw3-db'
    },
    serverInfo: {
        host: '757ba0fdab85',
            port: 27017,
            version: '7.0.2',
            gitVersion: '02b3c655e1302209ef046da6ba3ef6749dd0b62a'
    },
    serverParameters: {
        internalQueryFacetBufferSizeBytes: 104857600,
            internalQueryFacetMaxOutputDocSizeBytes: 104857600,
            internalLookupStageIntermediateDocumentMaxSizeBytes: 104857600,
            internalDocumentSourceGroupMaxMemoryBytes: 104857600,
            internalQueryMaxBlockingSortMemoryUsageBytes: 104857600,
            internalQueryProhibitBlockingMergeOnMongoS: 0,
            internalQueryMaxAddToSetBytes: 104857600,
            internalDocumentSourceSetWindowFieldsMaxMemoryBytes: 104857600,
            internalQueryFrameworkControl: 'trySbeEngine'
    },
    ok: 1
}