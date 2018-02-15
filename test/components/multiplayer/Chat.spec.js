import Enzyme, { shallow } from "enzyme";
import EnzymeAdapter from "enzyme-adapter-react-16";
import Chat from "../../../src/common/components/multiplayer/Chat";
import React from "react";
import { ToolbarTitle } from "material-ui/Toolbar";

Enzyme.configure({ adapter: new EnzymeAdapter()});

describe('Chat panel component', () => {
    describe('[props.roomName]', () => {
        const findToolbarTitleText = (wrapper) => {
            const element =  wrapper.find(ToolbarTitle);
            return element.props()["text"];
        };

        it('titles the chat pane "Chat" inGame', () => {
            const TEST_ROOM_NAME = 'Test Room';
            const wrapper = shallow(<Chat
                    roomName={TEST_ROOM_NAME}
                    inGame={true}
                    open={true}
                />);
            expect(findToolbarTitleText(wrapper)).toEqual('Chat');
        });

        it('titles the chat pane after roomName when not inGame', () => {
            const TEST_ROOM_NAME = 'Test Room';
            const wrapper = shallow(<Chat
                    roomName={TEST_ROOM_NAME}
                    inGame={false}
                    open={true}
                />);
            expect(findToolbarTitleText(wrapper)).toEqual(TEST_ROOM_NAME);
        });

        it('titles the chat pane "Lobby" when no roomName and not inGame', () => {
            const wrapper = shallow(<Chat
                    inGame={false}
                    open={true}
                />);
            expect(findToolbarTitleText(wrapper)).toEqual('Lobby');
        });
    });
});
