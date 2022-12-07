import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, } from "react-native";

const DropDown = ({
    data = [],
    busSchedulePage,
    driverLoginPage,
    value = {},
    onSelect = (item) => { }
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
                {(
                    driverLoginPage ?
                        <Text>{Object.entries(value).length > 0 ? value?.name : `Choose Name`}</Text>
                        : busSchedulePage ?
                            <Text>{!!value ? value?.name : `Choose Ferry`}</Text>
                            :
                            <Text>{!!value ? value?.name : `Choose Company`}</Text>
                )}
                <Image style={{
                    width: 12,
                    height: 12,
                    transform: [{ rotate: showOption ? '180deg' : '0deg' }]
                }} source={require('../../assets/images/dropdown.png')} />
            </TouchableOpacity>
            {showOption && (<View style={{
                marginTop: 55,
                backgroundColor: '#dcdcdc',
                width: '100%',
                padding: 0,
                maxHeight: 151,
                borderRadius: 8,
                borderStyle: 'solid',
                zIndex: 2,
                position: 'absolute',

            }}>
                <ScrollView
                    showsHorizontalScrollIndicator={true}
                    showsVerticalScrollIndicator={false}
                    {...data} nestedScrollEnabled={true}
                >
                    {data.map((val, i) => {
                        return (
                            <TouchableOpacity
                                key={String(i)}
                                onPress={() => onSelectedItem(val)}
                                style={{
                                    top: 1,
                                    backgroundColor: 'white',
                                    paddingVertical: 15,
                                    paddingHorizontal: 15,
                                    color: 'black',
                                    borderStyle: 'solid',
                                    marginBottom: 0.9,
                                    borderRadius: 2,
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Text style={{
                                    color: 'black',
                                }}>{val.name}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>)}
        </View>
    );
};

const styles = StyleSheet.create({
    dropDownStyle: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 8,
        minHeight: 52,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

});

export default DropDown;