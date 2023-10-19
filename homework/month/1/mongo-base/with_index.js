{
  explainVersion: '2',
      queryPlanner: {
  namespace: 'hw3-db.movies',
      indexFilterSet: false,
      parsedQuery: {
    '$text': {
      '$search': 'killer',
          '$language': 'english',
          '$caseSensitive': false,
          '$diacriticSensitive': false
    }
  },
  queryHash: '1E91F5B2',
      planCacheKey: '6D860350',
      maxIndexedOrSolutionsReached: false,
      maxIndexedAndSolutionsReached: false,
      maxScansToExplodeReached: false,
      winningPlan: {
    queryPlan: {
      stage: 'TEXT_MATCH',
          planNodeId: 3,
          indexPrefix: {},
      indexName: 'fullplot_text',
          parsedTextQuery: {
        terms: [ 'killer' ],
            negatedTerms: [],
            phrases: [],
            negatedPhrases: []
      },
      textIndexVersion: 2,
          inputStage: {
        stage: 'FETCH',
            planNodeId: 2,
            inputStage: {
          stage: 'IXSCAN',
              planNodeId: 1,
              keyPattern: { _fts: 'text', _ftsx: 1 },
          indexName: 'fullplot_text',
              isMultiKey: true,
              isUnique: false,
              isSparse: false,
              isPartial: false,
              indexVersion: 2,
              direction: 'backward',
              indexBounds: {}
        }
      }
    },
    slotBasedPlan: {
      slots: '$$RESULT=s9 env: { s2 = Nothing (SEARCH_META), s8 = {"_fts" : "text", "_ftsx" : 1}, s3 = 1697736261959 (NOW), s1 = TimeZoneDatabase(Antarctica/Casey...America/Cayenne) (timeZoneDB) }',
          stages: '[3] filter {\n' +
      '    if isObject(s9) \n' +
      '    then ftsMatch(FtsMatcher({"terms" : ["killer"], "negatedTerms" : [], "phrases" : [], "negatedPhrases" : []}), s9) \n' +
      '    else fail(4623400, "textmatch requires input to be an object") \n' +
      '} \n' +
      '[2] nlj inner [] [s4, s5, s6, s7, s8] \n' +
      '    left \n' +
      '        [1] unique [s4] \n' +
      '        [1] ixseek KS(3C6B696C6C6572002E77359400FE04) KS(3C6B696C6C657200290104) s7 s4 s5 s6 [] @"1236ee16-61bf-43d6-a43c-b360c6e5da75" @"fullplot_text" false \n' +
      '    right \n' +
      '        [2] limit 1 \n' +
      '        [2] seek s4 s9 s10 s5 s6 s7 s8 [] @"1236ee16-61bf-43d6-a43c-b360c6e5da75" true false \n'
    }
  },
  rejectedPlans: []
},
  executionStats: {
    executionSuccess: true,
        nReturned: 546,
        executionTimeMillis: 4,
        totalKeysExamined: 546,
        totalDocsExamined: 546,
        executionStages: {
      stage: 'filter',
          planNodeId: 3,
          nReturned: 546,
          executionTimeMillisEstimate: 4,
          opens: 1,
          closes: 1,
          saveState: 0,
          restoreState: 0,
          isEOF: 1,
          numTested: 546,
          filter: '\n' +
      '    if isObject(s9) \n' +
      '    then ftsMatch(FtsMatcher({"terms" : ["killer"], "negatedTerms" : [], "phrases" : [], "negatedPhrases" : []}), s9) \n' +
      '    else fail(4623400, "textmatch requires input to be an object") \n',
          inputStage: {
        stage: 'nlj',
            planNodeId: 2,
            nReturned: 546,
            executionTimeMillisEstimate: 4,
            opens: 1,
            closes: 1,
            saveState: 0,
            restoreState: 0,
            isEOF: 1,
            totalDocsExamined: 546,
            totalKeysExamined: 546,
            collectionScans: 0,
            collectionSeeks: 546,
            indexScans: 0,
            indexSeeks: 1,
            indexesUsed: [ 'fullplot_text' ],
            innerOpens: 546,
            innerCloses: 1,
            outerProjects: [],
            outerCorrelated: [ Long("4"), Long("5"), Long("6"), Long("7"), Long("8") ],
            outerStage: {
          stage: 'unique',
              planNodeId: 1,
              nReturned: 546,
              executionTimeMillisEstimate: 0,
              opens: 1,
              closes: 1,
              saveState: 0,
              restoreState: 0,
              isEOF: 1,
              dupsTested: 546,
              dupsDropped: 0,
              keySlots: [ Long("4") ],
              inputStage: {
            stage: 'ixseek',
                planNodeId: 1,
                nReturned: 546,
                executionTimeMillisEstimate: 0,
                opens: 1,
                closes: 1,
                saveState: 0,
                restoreState: 0,
                isEOF: 1,
                indexName: 'fullplot_text',
                keysExamined: 546,
                seeks: 1,
                numReads: 547,
                indexKeySlot: 7,
                recordIdSlot: 4,
                snapshotIdSlot: 5,
                indexIdentSlot: 6,
                outputSlots: [],
                indexKeysToInclude: '00000000000000000000000000000000',
                seekKeyLow: 'KS(3C6B696C6C6572002E77359400FE04) ',
                seekKeyHigh: 'KS(3C6B696C6C657200290104) '
          }
        },
        innerStage: {
          stage: 'limit',
              planNodeId: 2,
              nReturned: 546,
              executionTimeMillisEstimate: 4,
              opens: 546,
              closes: 1,
              saveState: 0,
              restoreState: 0,
              isEOF: 1,
              limit: 1,
              inputStage: {
            stage: 'seek',
                planNodeId: 2,
                nReturned: 546,
                executionTimeMillisEstimate: 4,
                opens: 546,
                closes: 1,
                saveState: 0,
                restoreState: 0,
                isEOF: 0,
                numReads: 546,
                recordSlot: 9,
                recordIdSlot: 10,
                seekKeySlot: 4,
                snapshotIdSlot: 5,
                indexIdentSlot: 6,
                indexKeySlot: 7,
                indexKeyPatternSlot: 8,
                fields: [],
                outputSlots: []
          }
        }
      }
    }
  },
  command: {
    find: 'movies',
        filter: { '$text': { '$search': 'killer' } },
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