<template lang="pug">
v-flex(xs12 lg4)
  v-container(grid-list-xl)
    v-layout(row wrap)
      v-flex(xs12 sm6 lg12)
        v-card
          v-card-title Step 2. Training
          v-card-actions
            v-btn(:to='{name: "CollectData"}')
              v-icon chevron_left
              | Collect Data
            v-spacer
            v-btn.primary(@click='startTraining' v-bind:loading='isBusy')
              | Start Training
              v-icon.ml-1 school
      v-flex(xs12 sm6 lg12)
        v-card(color='amber darken-2')
          v-card-title Visualizations
          v-card-text
            div(ref='visualizations')

        //- Snackbars
        v-snackbar(v-model='snackbar.modelTrained') Model training complete 🎉
</template>

<script>
import * as tf from "@tensorflow/tfjs";
// import * as tfvis from "@tensorflow/tfjs-vis";
import { mapState } from "vuex";

export default {
  name: "Training",

  data: () => ({
    isBusy: false,

    rawData: {},
    tensors: {},

    snackbar: {
      modelTrained: false
    }
  }),

  computed: mapState(["training"]),

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
      const model = this.createLinearRegressionModel(this.rawData);
      console.log(model);
      this.compileAndTrain(model);
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

    compileAndTrain() {
      this.snackbar.modelTrained = true;
    }
  }
};
</script>