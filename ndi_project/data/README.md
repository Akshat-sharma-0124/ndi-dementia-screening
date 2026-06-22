# Labeled audio dataset

Place real, consented WAV recordings in exactly one class folder:

- `healthy/`
- `mci/`
- `moderate/`
- `severe/`

The folder name is the training label. Nested participant folders are supported.
Do not place multiple recordings from one participant across train and test data;
for a formal study, replace the sample-level split with a participant-grouped split.

The 40 text transcripts supplied with the project are not used to train the Random
Forest because they do not contain genuine timing, pause, MFCC, or pitch information.
They remain useful for qualitative tests of the narrative-analysis layer.

