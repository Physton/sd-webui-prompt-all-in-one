import common from "@/utils/common";
import GradioAPI from "@/utils/gradioAPI";

export default {
    data() {
        return {
            /**
             * @type {GradioAPI}
             */
            gradioAPI: null,
        }
    },
    beforeMount() {
        this.gradioAPI = new GradioAPI()
    }
}