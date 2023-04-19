import { BaseItem } from "../BaseItem";
import { Automation } from "../../components/Automation/Automation";

const STRESS_LABEL_TYPES = {
    CORE: 0,
    CONDENSED: 1,
    CUSTOM: 2,
};

export class StressItem extends BaseItem {
    static get documentName() {
        return "stress";
    }

    static activateActorSheetListeners(html, sheet) {
        super.activateActorSheetListeners(html, sheet);

        // Check or uncheck a single box
        html.find(".fatex-js-stress-checkbox").click((e) => this._onStressBoxToggle.call(this, e, sheet));
    }

    static prepareItemData(data, item) {
        let numberOfBoxes = parseInt(data.system.size) + Automation.getBoxAmountModifier(item);

        // Negative number of boxes is not allowed
        if (numberOfBoxes < 0) {
            numberOfBoxes = 0;
        }

        // Add boxes with prepared data
        data.boxes = [...Array(numberOfBoxes).keys()].map((i) => ({
            isChecked: data.system.value & (2 ** i),
            label: this._getBoxLabel(data, i),
        }));

        // Add filler boxes if needed
        data.fillers = numberOfBoxes % 4 === 0 ? [] : [...Array(4 - (numberOfBoxes % 4)).keys()];

        if (item.isOwned) {
            data.isDisabled = numberOfBoxes <= 0 || Automation.getDisabledState(item);
        }

        return data;
    }

    static _getBoxLabel(item, i) {
        if (item.system.labelType === STRESS_LABEL_TYPES.CONDENSED) {
            return "1";
        }

        if (item.system.labelType === STRESS_LABEL_TYPES.CUSTOM) {
            return item.system.customLabel.split(" ")[i];
        }

        return i + 1;
    }

    static _getToggledStressValue(currentStressTrackValue, boxIndexToToggle) {
        return currentStressTrackValue ^ (2 ** boxIndexToToggle);
    }

    /*************************
     * EVENT HANDLER
     *************************/

    static _onStressBoxToggle(e, sheet) {
        e.preventDefault();

        const dataset = e.currentTarget.dataset;
        const item = sheet.actor.items.get(dataset.item);
        const index = dataset.index;

        if (item) {
            const newValue = StressItem._getToggledStressValue(item.system.value, index);

            item.update(
                {
                    "system.value": newValue,
                },
                {}
            );
        }
    }
}
