<template lang="pug">
v-flex(xs12 lg4)
  v-container(grid-list-xl)
    v-layout(row wrap)
      v-flex(xs12 sm6 lg12)
        v-card
          v-card-title Step 2. Training
          v-card-text
            v-text-field(label='Number of Epochs' v-model='numEpochs' filled)
            v-text-field(label='Batch Size' v-model='batchSize' filled)
            v-text-field(label='Learning Rate' v-model='learningRate' filled)
          v-card-actions
            v-btn(:to='{name: "CollectData"}')
              v-icon chevron_left
              | Collect Data
            v-spacer
            v-btn.primary(@click='startTraining' v-bind:loading='isBusy')
              | Start Training
              v-icon.ml-1 school
      v-flex(xs12 sm6 lg12)
        v-card(color='amber lighten-4')
          v-card-title Visualizations
          v-card-text
            div(ref='visualizations')

        //- Modal
        v-dialog(v-model='isModalVisible' max-width=600)
          v-card
            v-card-title 🎉 Model Ready
            v-card-text
              p Here is some feedback about your model:
              p Final train-set loss: {{feedback.trainLoss}}
              p Final validation-set loss: {{feedback.valLoss}}
              p Final test-set loss: {{feedback.testLoss}}
            v-card-actions
              v-btn.primary(@click='downloadJSON')
                v-icon.mr-2 save_alt
                | Download
              v-btn.primary(@click='saveToLocalStorage')
                v-icon.mr-2 save
                | localStorage
              v-spacer
              v-btn.primary(:to='{name: "UseModel"}')
                | Use the model
                v-icon.mr-2 chevron_right
</template>

<script>
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { mapState } from "vuex";

export default {
  name: "Training",

  data: () => ({
    isBusy: false,

    rawData: {},
    tensors: {},
    trainingLogs: [],

    feedback: {
      trainLoss: 0,
      validationSetLoss: 0,
      testSetLoss: 0
    },

    numEpochs: 100,
    learningRate: 0.001,
    batchSize: 32,

    isModalVisible: false
  }),

  computed: mapState(["training", "model"]),

  methods: {
    /**
     * Starts the training process
     */
    startTraining() {
      this.isBusy = true;

      this.rawData = this.splitTrainingData(this.training);
      this.tensors = this.setupTensors(this.rawData);

      // Normalize mean and standard deviation of data.
      let { dataMean, dataStd } = this.getMeanAndStandardDeviation(
        this.tensors.rawTrainFeatures
      );
      this.tensors.trainFeatures = this.normalizeTensor(
        this.tensors.rawTrainFeatures,
        dataMean,
        dataStd
      );
      this.tensors.testFeatures = this.normalizeTensor(
        this.tensors.rawTestFeatures,
        dataMean,
        dataStd
      );

      // Create the model
      this.$store.commit("set", [
        "model",
        this.createLinearRegressionModel(this.rawData)
      ]);
      this.compileAndTrain(this.model, this.tensors);
    },

    /**
     * Splits the training data
     */
    splitTrainingData(data) {
      const featureLength = data.features.length;
      const labelLength = data.labels.length;

      return {
        trainFeatures: data.features.slice(0, Math.floor(featureLength * 0.7)),
        testFeatures: data.features.slice(0, Math.floor(featureLength * 0.3)),
        trainTargets: data.labels.slice(0, Math.floor(labelLength * 0.7)),
        testTargets: data.labels.slice(0, Math.floor(labelLength * 0.3))
      };
    },

    /**
     * Setup Tensors
     * @return tensors
     */
    setupTensors(rawData) {
      const tensors = {};

      // Setup Feature tensors
      tensors.rawTrainFeatures = tf.tensor2d(rawData.trainFeatures);
      tensors.trainPitch = tf.tensor2d(rawData.trainTargets.map(i => [i[0]]));
      tensors.trainYaw = tf.tensor2d(rawData.trainTargets.map(i => [i[1]]));
      tensors.trainRoll = tf.tensor2d(rawData.trainTargets.map(i => [i[2]]));

      // Setup Test tensors
      tensors.rawTestFeatures = tf.tensor2d(rawData.testFeatures);
      tensors.testPitch = tf.tensor2d(rawData.testTargets.map(i => [i[0]]));
      tensors.testYaw = tf.tensor2d(rawData.testTargets.map(i => [i[1]]));
      tensors.testRoll = tf.tensor2d(rawData.testTargets.map(i => [i[2]]));

      return tensors;
    },

    /**
     * Gets the mean and standard deviation of the dataset
     */
    getMeanAndStandardDeviation(data) {
      const dataMean = data.mean(0);
      const diffFromMean = data.sub(dataMean);
      const squareDiffFromMean = diffFromMean.square();
      const variance = squareDiffFromMean.mean(0);
      const dataStd = variance.sqrt();

      return { dataMean, dataStd };
    },

    /**
     * Normalizes a tensor
     */
    normalizeTensor(data, dataMean, dataStd) {
      return data.sub(dataMean).div(dataStd);
    },

    /**
     * Creates a simple linear regresion model
     * @return model
     */
    createLinearRegressionModel(rawData) {
      const model = tf.sequential();
      // Simple linear regression
      model.add(
        tf.layers.dense({
          inputShape: [rawData.trainFeatures[0].length],
          units: 1
        })
      );
      model.summary();

      return model;
    },

    /**
     * Trains the model
     */
    async compileAndTrain(model, tensors) {
      model.compile({
        optimizer: tf.train.sgd(+this.learningRate),
        loss: "meanSquaredError"
      });

      await model.fit(tensors.trainFeatures, tensors.trainPitch, {
        batchSize: +this.batchSize,
        epochs: +this.numEpochs,
        validationSplit: 0.3,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(`⏳ Epoch ${epoch + 1} of ${this.numEpochs} completed`);
            this.trainingLogs.push(logs);
            tfvis.show.history(this.$refs.visualizations, this.trainingLogs, [
              "loss",
              "val_loss"
            ]);
          }
        }
      });

      console.log("🎉 Training complete! Now running tests...");
      const result = model.evaluate(tensors.testFeatures, tensors.testPitch, {
        batchSize: this.batchSize
      });
      this.feedback.testLoss = result.dataSync()[0];
      this.feedback.trainLoss = this.trainingLogs[
        this.trainingLogs.length - 1
      ].loss;
      this.feedback.valLoss = this.trainingLogs[
        this.trainingLogs.length - 1
      ].val_loss;

      this.isBusy = false;
      this.isModalVisible = true;
    },

    async saveToLocalStorage() {
      this.isBusy = true;
      await this.model.save("localstorage://posenetCursor");
      this.isBusy = false;
    },

    async downloadJSON() {
      this.isBusy = true;
      await this.model.save("downloads://posenetCursor");
      this.isBusy = false;
    }
  }
};
</script>