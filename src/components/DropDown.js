import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import imagesPath from '../utils/constants/imagesPath'

const DropDown = ({
    data = [],
    value = {},
    onSelect = () => { }
}) => {
    const [showOption, setShowOption] = useState(false)
    const onSelectedItem = (val) => {
        setShowOption(false)
        onSelect(val)
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.dropDownStyle}
                onPress={() => setShowOption(!showOption)}
            >
                <Text>{!!value ? value?.name : `Choose company`}</Text>
                <Image style={{
                    width: 12,
                    height: 12,
                    transform: [{ rotate: showOption ? '180deg' : '0deg' }]
                }} source={imagesPath.icDropDown} />
            </TouchableOpacity>
            {showOption && (<View>
                {data.map((val, i) => {
                    return (
                        <TouchableOpacity
                            key={String(i)}
                            onPress={() => onSelectedItem(val)}
                            style={{
                                backgroundColor: 'white',
                                paddingVertical: 10,
                                borderRadius: 4,
                                paddingHorizontal: 10,
                                top: 5,
                                marginBottom: 5,
                            }}
                        >
                            <Text >{val.name}</Text>
                        </TouchableOpacity>

                    )
                })}
            </View>)}
        </View>
    );
};

const styles = StyleSheet.create({
    dropDownStyle: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 6,
        minHeight: 42,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
    },

});

export default DropDown;